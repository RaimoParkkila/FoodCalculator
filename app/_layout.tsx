import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDB } from "../db";

export default function RootLayout() {

  useEffect(() => {
    initDB();
  }, []);

  return <Stack />;
}