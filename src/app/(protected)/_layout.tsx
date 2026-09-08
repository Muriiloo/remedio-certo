import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function ProtectedLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remedy">
        <NativeTabs.Trigger.Label>Remédios</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="pills.fill" md="medication" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
