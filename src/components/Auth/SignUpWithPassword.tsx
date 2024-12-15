"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { postRegister } from "@/api/index";
import { useRouter } from "next/navigation";
import { SignUpData } from "@/types/signUpData";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
  
  const [data, setData] = useState<SignUpData>({
    username: "",
    password: "",
    name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (data.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const response = await postRegister(data);
      toast.success("Registration successful, routing to sign in page");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.response.data.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="username"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter your username"
            name="username"
            value={data.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter your name"
            name="name"
            value={data.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="password"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={data.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            autoComplete="new-password"
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
        >
          Sign Up
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-2 py-2">
        <Link
          href="/auth/signin"
          className="select-none font-satoshi text-base font-medium text-dark underline duration-300 hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Already have an account? Sign In
        </Link>
      </div>
    </form>
  );
}
