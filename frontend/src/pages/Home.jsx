import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineCheck } from 'react-icons/ai';

// Components...
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import MainArea from '../components/MainArea';
import CustomButton from '../components/CustomButton';
import CustomLoader from "../components/CustomLoader";

// Store...
import useAuthStore from '../store/AuthStore';

const Home = () => {
  const { token } = useAuthStore(); // Store...
  const [user, setUser] = useState({ name: "User" });
  const [greeting, setGreeting] = useState({ name: "User" });
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning ☀️";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon 🌤️";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening 🌇";
    } else {
      return "Good Night 🌙";
    };
  };

  const getUser = async () => {
    try {
      const userData = await window.api?.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error parsing user data:", error);
    };
  };
  const updateTime = () => {
    const now = new Date();
    setTime(
      now.toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <PageTitle>Home</PageTitle>
      <MainArea>
        {getGreeting()}-{user.name}
      </MainArea >
    </>
  );
};

export default Home;
