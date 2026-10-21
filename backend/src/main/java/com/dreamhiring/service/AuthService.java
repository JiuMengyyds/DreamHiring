package com.dreamhiring.service;

import com.dreamhiring.dto.AuthRequests.LoginRequest;
import com.dreamhiring.dto.AuthRequests.RegisterRequest;
import com.dreamhiring.vo.AuthViews.AuthView;
import com.dreamhiring.vo.AuthViews.UserProfileView;

public interface AuthService {

    AuthView register(RegisterRequest request);

    AuthView login(LoginRequest request);

    UserProfileView currentUser();
}
