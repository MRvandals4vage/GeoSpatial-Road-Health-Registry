package com.georoad.monitor.repository;

import com.georoad.monitor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailAddress(String email);
}
