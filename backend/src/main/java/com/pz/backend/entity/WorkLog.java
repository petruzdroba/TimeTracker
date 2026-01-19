package com.pz.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

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
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private UserAuth user;

    @Column(name = "work_date", nullable = false)
    private Instant date;

    @Column(name = "time_worked", nullable = false)
    private Long timeWorked;

    public WorkLog() {
    }

    public WorkLog(UserAuth user, Instant date, Long timeWorked) {
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

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Long getTimeWorked() {
        return timeWorked;
    }

    public void setTimeWorked(Long timeWorked) {
        this.timeWorked = timeWorked;
    }
}