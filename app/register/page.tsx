"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input } from "antd";
import { User } from "@/types/user";
import useLocalStorage from "@/hooks/useLocalStorage";

const Register: React.FC = () => { //functional component called register
  const router = useRouter();
  const apiService = useApi();     //hooks
  const [form] = Form.useForm(); 

  const { set: setToken } = useLocalStorage("token", "");   //storing token

  const handleRegister = async ( values: { username: string; password: string;} //function runs when form is submitted
) => { console.log("Registering with values: ", values); 

  try {
    const response = await apiService.post<User>("/users", values); //send post request to your backend

    if (!response || !response.token) { //check if server returned 
      alert("Registration failed: Invalid response");
      return;
    }

    localStorage.setItem("userId", response.id || ""); //save info
    setToken(response.token); //save token

    alert("Registration was successful! Redirecting...");
    router.push(`/users/${response.id}`); //redirect to user page

  } catch (error) {
    alert("Registration failed! Username might already be taken."); //error handliing
    console.error("Registration error:", error);
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
      Register
    </h1>

    <div style={{ width: "350px" }}>
      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={handleRegister}
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
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  </div>
);
};

export default Register;








