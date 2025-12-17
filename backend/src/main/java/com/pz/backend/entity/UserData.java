package com.pz.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="user_data")
public class UserData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserAuth user;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    private int workHours=8;
    private int vacationDays=12;
    private int personalTime=12;

    @Column(length = 50)
    private String role = "employee";

    protected UserData() {
    }

    public UserData(UserAuth user,String role, int personalTime, int vacationDays, int workHours, String email, String name) {
        this.user=user;
        this.role = role;
        this.personalTime = personalTime;
        this.vacationDays = vacationDays;
        this.workHours = workHours;
        this.email = email;
        this.name = name;
    }

    public UserData(UserAuth user, String name, String email) {
        this.user = user;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserAuth getUser() {
        return user;
    }

    public void setUser(UserAuth user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getWorkHours() {
        return workHours;
    }

    public void setWorkHours(int workHours) {
        this.workHours = workHours;
    }

    public int getVacationDays() {
        return vacationDays;
    }

    public void setVacationDays(int vacationDays) {
        this.vacationDays = vacationDays;
    }

    public int getPersonalTime() {
        return personalTime;
    }

    public void setPersonalTime(int personalTime) {
        this.personalTime = personalTime;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
