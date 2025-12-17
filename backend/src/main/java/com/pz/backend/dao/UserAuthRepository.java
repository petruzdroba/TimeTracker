package com.pz.backend.dao;

import com.pz.backend.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthRepository  extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findByEmail(String email);
}
