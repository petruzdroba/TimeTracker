package com.pz.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="work_log")
public class WorkLog {
    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserAuth user;

    @Lob
    @Column(name = "work_log", columnDefinition = "TEXT")
    private String workLog = "[]";

    public WorkLog() {
    }

    public WorkLog(UserAuth user, String workLog) {
        this.user = user;
        this.workLog = workLog;
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

    public String getWorkLog() {
        return workLog;
    }

    public void setWorkLog(String workLog) {
        this.workLog = workLog;
    }
}
