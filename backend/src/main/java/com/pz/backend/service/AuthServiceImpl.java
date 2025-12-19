package com.pz.backend.service;

import com.pz.backend.dao.TimerDataRepository;
import com.pz.backend.dao.UserAuthRepository;
import com.pz.backend.dao.UserDataRepository;
import com.pz.backend.entity.TimerData;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService{

    private final UserAuthRepository userAuthRepository;
    private final UserDataRepository userDataRepository;
    private final TimerDataRepository timerDataRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserAuthRepository userAuthRepository, UserDataRepository userDataRepository, TimerDataRepository timerDataRepository, PasswordEncoder passwordEncoder) {
        this.userAuthRepository = userAuthRepository;
        this.userDataRepository = userDataRepository;
        this.timerDataRepository = timerDataRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserData signUp(String name, String email, String password) throws Exception {
        if (userAuthRepository.findByEmail(email).isPresent() || userDataRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already exists");
        }

        UserAuth auth = new UserAuth(email, passwordEncoder.encode(password));
        userAuthRepository.save(auth);

        UserData userData = new UserData(auth, name, email);
        userDataRepository.save(userData);

        TimerData timerData = new TimerData(auth, userData.getWorkHours()*3600000);
        timerDataRepository.save(timerData);

        auth.setUserData(userData);

        return userData;
    }

    @Override
    public UserAuth logIn(String email, String password) throws Exception {
        UserAuth auth = userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(password, auth.getPassword())) {
            throw new Exception("Invalid credentials");
        }
        return auth;
    }

    @Override
    public UserData getMe(Long userId) throws Exception {
        if(userId == null)
            throw new Exception("User not found");

        return userDataRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
    }
}
