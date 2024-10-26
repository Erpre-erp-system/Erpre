package com.project.erpre.controller;

import com.project.erpre.model.entity.Employee;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import javax.servlet.http.HttpSession;

@Controller
public class MainController {


    @GetMapping("/")
    public String home() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || isAnonymous(authentication)) {
            return "redirect:/login";  // 인증되지 않은 사용자라면 login으로 리디렉션
        }
        return "redirect:/main";  // 인증된 사용자라면 main 페이지로 리디렉션
    }

    @GetMapping("/login")
    public String login() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !isAnonymous(authentication)) {
            return "redirect:/main";  // 이미 인증된 사용자라면 main 페이지로 리디렉션
        }
        return "login";  // 인증되지 않은 사용자에게 login 페이지 보여줌

    }

    @GetMapping("/{pageName}")
    public String page(@PathVariable String pageName, Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || isAnonymous(authentication)) {
            return "login";
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        if ("main".equals(pageName)) {
            model.addAttribute("employee", userDetails);
            return "view";
        }

        return "view";
    }


    private boolean isAnonymous(Authentication authentication) {
        return authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser");
    }

}
