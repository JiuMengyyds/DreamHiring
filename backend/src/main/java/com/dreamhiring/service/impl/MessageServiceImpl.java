package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageRequest;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.entity.MessageRecord;
import com.dreamhiring.mapper.MessageMapper;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.MessageService;
import com.dreamhiring.vo.MessageViews.MessageView;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageMapper messageMapper;

    public MessageServiceImpl(MessageMapper messageMapper) {
        this.messageMapper = messageMapper;
    }

    @Override
    public PageVO<MessageView> list(String type, Boolean read, int page, int size) {
        Long receiverId = currentPrincipal().id();
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<MessageRecord> messages = (Page<MessageRecord>) messageMapper.findByReceiverId(
                receiverId, type, read == null ? null : (read ? 1 : 0));
        List<MessageView> records = messages.stream().map(this::toView).toList();
        return PageVO.of(records, messages.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public long unreadCount() {
        return messageMapper.countUnread(currentPrincipal().id());
    }

    @Override
    public MessageView detail(Long messageId) {
        return toView(findOwned(messageId));
    }

    @Override
    @Transactional
    public MessageView markRead(Long messageId) {
        MessageRecord message = findOwned(messageId);
        messageMapper.markRead(messageId, message.getReceiverId());
        message.setIsRead(1);
        return toView(message);
    }

    @Override
    @Transactional
    public long markAllRead() {
        messageMapper.markAllRead(currentPrincipal().id());
        return 0;
    }

    @Override
    @Transactional
    public void delete(Long messageId) {
        MessageRecord message = findOwned(messageId);
        messageMapper.logicalDelete(messageId, message.getReceiverId());
    }

    private MessageRecord findOwned(Long messageId) {
        MessageRecord message = messageMapper.findByIdAndReceiver(messageId, currentPrincipal().id());
        if (message == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "消息不存在或已删除");
        }
        return message;
    }

    private SecurityPrincipal currentPrincipal() {
        return AuthServiceImpl.requirePrincipal();
    }

    private MessageView toView(MessageRecord message) {
        return new MessageView(
                message.getId(),
                message.getReceiverId(),
                message.getType(),
                message.getTitle(),
                message.getContent(),
                message.getRelatedId(),
                message.getIsRead() != null && message.getIsRead() == 1,
                message.getCreateTime()
        );
    }
}
