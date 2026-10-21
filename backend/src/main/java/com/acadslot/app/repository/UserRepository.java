package com.acadslot.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acadslot.app.entity.User;
import com.acadslot.app.entity.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(Role role);
    List<User> findByRoleIn(List<Role> roles);
    List<User> findByRoleAndIsActive(Role role, boolean isActive);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
