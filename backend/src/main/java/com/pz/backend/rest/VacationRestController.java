package com.pz.backend.rest;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.dto.VacationPostRequest;
import com.pz.backend.dto.VacationPutRequest;
import com.pz.backend.entity.Status;
import com.pz.backend.entity.Vacation;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InsufficientVacationDaysException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.VacationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VacationRestController {

    private final VacationService vacationService;

    public VacationRestController(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    @GetMapping("/vacation")
    public List<Vacation> getAll() {
        return vacationService.getAll();
    }

    @GetMapping("/vacation/status/{status}")
    public List<Vacation> getByStatus(@PathVariable Status status) {
        return vacationService.getStatus(status);
    }

    @PreAuthorize("hasRole('MANAGER') or @vacationSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/vacation/user/{userId}")
    public List<Vacation> getAllByUser(@PathVariable Long userId) throws NotFoundException {
        return vacationService.get(userId);
    }

    @PreAuthorize("hasRole('MANAGER') or @vacationSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/vacation/user/{userId}/{relation}")
    public List<Vacation> getAllByTimeRelation(@PathVariable Long userId, @PathVariable TimeRelation relation) throws NotFoundException {
        return vacationService.getVacationsByTimeRelation(userId, relation);
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN') or @vacationSecurity.canAccessUser(#userId, authentication)")
    @GetMapping("/vacation/user/remaining/{userId}")
    public Long getRemaining(@PathVariable Long userId) throws NotFoundException {
        return vacationService.getRemainingDays(userId);
    }

    @PreAuthorize("@vacationSecurity.canAccessUser(#request.userId, authentication)")
    @PostMapping("/vacation")
    public Vacation post(@Valid @RequestBody VacationPostRequest request) throws AlreadyExistsException, InsufficientVacationDaysException {
        return vacationService.post(
                request.userId(),
                request.startDate(),
                request.endDate(),
                request.description()
        );
    }

    @PreAuthorize("@vacationSecurity.isOwner(#request.id, authentication)")
    @PutMapping("/vacation")
    public Vacation put(@Valid @RequestBody VacationPutRequest request) throws NotFoundException,InsufficientVacationDaysException {
        return vacationService.put(
                request.id(),
                request.userId(),
                request.startDate(),
                request.endDate(),
                request.description()
        );
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/vacation/{vacationId}/{status}")
    public Vacation putStatus(@PathVariable Long vacationId, @PathVariable Status status) throws NotFoundException {
        return vacationService.updateStatus(vacationId, status);
    }

    @PreAuthorize("@vacationSecurity.isOwner(#vacationId, authentication)")
    @DeleteMapping("/vacation/{vacationId}")
    public void delete(@PathVariable Long vacationId) throws NotFoundException {
        vacationService.delete(vacationId);
    }
}
