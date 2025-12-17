package com.pz.backend.service;

import com.pz.backend.dao.UserAuthRepository;
import com.pz.backend.dao.UserDataRepository;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService{

    private final UserAuthRepository userAuthRepository;
    private final UserDataRepository userDataRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserAuthRepository userAuthRepository, UserDataRepository userDataRepository, PasswordEncoder passwordEncoder) {
        this.userAuthRepository = userAuthRepository;
        this.userDataRepository = userDataRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserData signUp(String name, String email, String password) throws Exception {
        if (userAuthRepository.findByEmail(email).isPresent() || userDataRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already exists");
        }

        UserAuth auth = userAuthRepository.save(new UserAuth(email, passwordEncoder.encode(password)));
        return userDataRepository.save(new UserData(auth, name, email));
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
}
