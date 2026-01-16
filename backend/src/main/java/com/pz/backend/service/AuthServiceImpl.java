package com.pz.backend.service;

import com.pz.backend.dao.*;
import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InvalidCredentialsException;
import com.pz.backend.exceptions.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserAuthRepository userAuthRepository;
    private final UserDataRepository userDataRepository;
    private final TimerDataRepository timerDataRepository;
    private final WorkLogRepository workLogRepository;
    private final VacationRepository vacationRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserAuthRepository userAuthRepository, UserDataRepository userDataRepository, TimerDataRepository timerDataRepository, WorkLogRepository workLogRepository, VacationRepository vacationRepository, PasswordEncoder passwordEncoder) {
        this.userAuthRepository = userAuthRepository;
        this.userDataRepository = userDataRepository;
        this.timerDataRepository = timerDataRepository;
        this.workLogRepository = workLogRepository;
        this.vacationRepository = vacationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserData signUp(String name, String email, String password) throws AlreadyExistsException {
        if (userAuthRepository.findByEmail(email).isPresent() || userDataRepository.findByEmail(email).isPresent()) {
            throw new AlreadyExistsException(UserAuth.class.getName(), email);
        }

        UserAuth auth = new UserAuth(email, passwordEncoder.encode(password));
        userAuthRepository.save(auth);

        UserData userData = new UserData(auth, name, email);
        userDataRepository.save(userData);

        TimerData timerData = new TimerData(auth, userData.getWorkHours() * 3600000);
        timerDataRepository.save(timerData);

        WorkLog workLog = new WorkLog(auth, LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant(), 0L);
        workLogRepository.save(workLog);

        auth.setUserData(userData);

        return userData;
    }

    @Override
    public UserAuth logIn(String email, String password) throws NotFoundException, InvalidCredentialsException {
        UserAuth auth = userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(UserAuth.class.getName(), email));

        if (!passwordEncoder.matches(password, auth.getPassword())) {
            throw new InvalidCredentialsException();
        }
        return auth;
    }

    @Override
    public UserData getMe(Long userId) throws NotFoundException {
        if (userId == null)
            throw new NotFoundException("User cannot have id null");

        return userDataRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(UserData.class.getName(), userId));
    }
}
