package com.dreamhiring.entity;

public final class DomainEnums {

    private DomainEnums() {
    }

    public enum UserStatus {
        ACTIVE,
        DISABLED
    }

    public enum CompanyAuditStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public enum JobStatus {
        DRAFT,
        PUBLISHED,
        OFFLINE
    }

    public enum AuditStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public enum ApplicationStatus {
        PENDING_VIEW,
        VIEWED,
        INTERVIEW,
        REJECTED
    }

    public enum EducationLevel {
        COLLEGE,
        BACHELOR,
        MASTER,
        DOCTOR,
        UNLIMITED
    }

    public enum ExperienceLevel {
        FRESH,
        ONE_TO_THREE,
        THREE_TO_FIVE,
        FIVE_TO_TEN,
        TEN_PLUS,
        UNLIMITED
    }

    public enum MessageType {
        APPLICATION,
        ANNOUNCEMENT,
        SYSTEM
    }

    public enum AnnouncementStatus {
        DRAFT,
        PUBLISHED,
        OFFLINE
    }

    public enum AnnouncementChannel {
        ALL,
        SEEKER,
        COMPANY
    }
}
