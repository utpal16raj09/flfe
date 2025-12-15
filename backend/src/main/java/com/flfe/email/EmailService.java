package com.flfe.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.product.name:FLFE}")
    private String productName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String to, String userName, List<String> features) {
        String subject = "Welcome to " + productName;
        StringBuilder body = new StringBuilder();
        body.append("Hi ").append(userName).append(",\n\n")
                .append("Welcome to ").append(productName).append("! We're excited to have you on board.\n\n")
                .append("Here are some things you can do right away:\n");
        for (String feature : features) {
            body.append(" - ").append(feature).append("\n");
        }
        body.append("\nIf you have any questions, just reply to this email.\n\nCheers,\nThe ")
                .append(productName).append(" Team");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromAddress);
        message.setSubject(subject);
        message.setText(body.toString());
        mailSender.send(message);
    }
}
