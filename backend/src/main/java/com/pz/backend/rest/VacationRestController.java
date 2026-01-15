package com.pz.backend.rest;

import com.pz.backend.dto.VacationPostRequest;
import com.pz.backend.dto.VacationPutRequest;
import com.pz.backend.entity.Vacation;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import com.pz.backend.service.VacationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VacationRestController {

    private final VacationService vacationService;

    public VacationRestController(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    @GetMapping("/vacation/{userId}")
    public List<Vacation> getAllByUser(@PathVariable Long userId){

    }

    @PostMapping("/vacation")
    public Vacation post(@Valid @RequestBody VacationPostRequest request) throws AlreadyExistsException {

    }

    @PutMapping("/vacation")
    public Vacation put(@Valid @RequestBody VacationPutRequest request) throws NotFoundException{

    }

    @DeleteMapping("vacation/{vacationId}")
    public void delete(@PathVariable Long vacationId) throws NotFoundException{

    }
}
