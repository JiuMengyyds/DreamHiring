package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.vo.MessageViews.MessageView;

public interface MessageService {

    PageVO<MessageView> list(String type, Boolean read, int page, int size);

    long unreadCount();

    MessageView detail(Long messageId);

    MessageView markRead(Long messageId);

    long markAllRead();

    void delete(Long messageId);
}
