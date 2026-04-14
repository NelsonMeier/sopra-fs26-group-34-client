"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, App } from "antd";
import React from "react";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("userId", "");
  const { set: setUsername } = useLocalStorage<string>("username", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/login", values);

      if (!response || !response.token) {
        message.error("Login failed: Invalid credentials");
        router.push('/');
        return;
      }

      setToken(response.token);
      if (response.id) {
        setUserId(response.id);
      }
      if (response.username) {
        setUsername(response.username);
        //tell weboscket context about the new username so it can subscribe to the personal invite topic
        window.dispatchEvent(new Event("username-set"));
      }

      localStorage.setItem("loggedInUserId", response?.id || "");
      message.success("Login successful! Redirecting...");
      router.push(`/users/${response.id}`);

    } catch (error) {
      if (error instanceof Error) {
        message.error(`Something went wrong during the login:\n${error.message}`);
        router.push('/');
      } else {
        console.error("An unknown error occurred during login.");
        router.push('/');
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>

      <h1 style={{
        fontFamily: "var(--font-chewy)",
        fontSize: "3.5rem",
        color: "black",
        margin: 0,
        marginBottom: "2rem"
      }}>
        Login
      </h1>

      <div style={{ width: "350px" }}>
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={handleLogin}
          size="large"
          variant="outlined">

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
            style={{ color: "black" }}
            labelCol={{ style: { fontFamily: "var(--font-chewy)", fontSize: "1.2rem" } }}>
            <Input
              placeholder="Enter username"
              style={{ borderRadius: "12px", height: "50px", backgroundColor: "white", color: "black" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
            style={{ color: "black" }}
            labelCol={{ style: { fontFamily: "var(--font-chewy)", fontSize: "1.2rem" } }}>
            <Input.Password
              placeholder="Enter password"
              style={{ borderRadius: "12px", height: "50px", backgroundColor: "white", color: "black" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#E8956D",
                borderRadius: "30px",
                width: "100%",
                height: "65px",
                fontSize: "1.4rem",
                fontFamily: "var(--font-chewy)",
                border: "none",
                color: "black",
                boxShadow: "0px 8px 10px rgba(0,0,0,0.4)",
                marginTop: "1rem"
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;