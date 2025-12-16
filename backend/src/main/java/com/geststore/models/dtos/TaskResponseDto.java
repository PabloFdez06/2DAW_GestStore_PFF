package com.geststore.models.dtos;

import com.geststore.models.entities.TaskPriority;
import com.geststore.models.entities.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO para responder información de una tarea
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseDto {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
    private Boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponseDto assignedUser;
    private UserResponseDto createdByUser;
    private Set<TaskProductResponseDto> taskProducts;
}
