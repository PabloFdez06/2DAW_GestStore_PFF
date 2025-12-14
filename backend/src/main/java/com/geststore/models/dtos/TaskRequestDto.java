package com.geststore.models.dtos;

import com.geststore.models.entities.TaskPriority;
import com.geststore.models.entities.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para crear/actualizar una tarea
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequestDto {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
    private Boolean completed;
    private Long assignedUserId;
}
