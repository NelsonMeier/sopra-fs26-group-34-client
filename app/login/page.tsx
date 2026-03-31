"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    set: setToken,
  } = useLocalStorage<string>("token", "");
  const {
    set: setUserId,
  } = useLocalStorage<string>("userId", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/login", values);

<<<<<<< friends-branch
      // Store token and user ID
      if (response.token) {
        setToken(response.token);
=======
      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (!response || !response.token) {
        alert("Login failed: Invalid credentials");
        router.push('/');
        return;
>>>>>>> main
      }
      if (response.id) {
        setUserId(response.id);
      }

      localStorage.setItem("loggedInUserId", response?.id || "");
      setToken(response.token);
      alert("Login successful! Redirecting...");
      router.push(`/users/${response.id}`);

    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
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
