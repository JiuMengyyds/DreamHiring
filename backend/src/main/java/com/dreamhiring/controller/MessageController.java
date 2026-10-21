package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.service.MessageService;
import com.dreamhiring.vo.CountView;
import com.dreamhiring.vo.MessageViews.MessageView;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public Result<PageVO<MessageView>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(messageService.list(type, isRead, page, size));
    }

    @GetMapping("/unread-count")
    public Result<CountView> unreadCount() {
        return Result.success(new CountView(messageService.unreadCount()));
    }

    @GetMapping("/{messageId}")
    public Result<MessageView> detail(@PathVariable Long messageId) {
        return Result.success(messageService.detail(messageId));
    }

    @PutMapping("/{messageId}/read")
    public Result<MessageView> markRead(@PathVariable Long messageId) {
        return Result.success(messageService.markRead(messageId));
    }

    @PutMapping("/read-all")
    public Result<CountView> markAllRead() {
        return Result.success(new CountView(messageService.markAllRead()));
    }

    @DeleteMapping("/{messageId}")
    public Result<Void> delete(@PathVariable Long messageId) {
        messageService.delete(messageId);
        return Result.success();
    }
}
