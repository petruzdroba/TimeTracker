package com.pz.backend.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "work_log",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "work_date"})
)
public class WorkLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAuth user;

    @Column(name = "work_date", nullable = false)
    private LocalDate date;

    @Column(name = "time_worked", nullable = false)
    private Long timeWorked;

    public WorkLog() {
    }

    public WorkLog(UserAuth user, LocalDate date, Long timeWorked) {
        this.user = user;
        this.date = date;
        this.timeWorked = timeWorked;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getTimeWorked() {
        return timeWorked;
    }

    public void setTimeWorked(Long timeWorked) {
        this.timeWorked = timeWorked;
    }
}