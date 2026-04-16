"use client";

import { useEffect, useState } from "react";

import type { DashboardHealthData } from "@/app/dashboard/_lib/dashboard-data";

import { HealthCard } from "./dashboard-panels";

const HEALTH_REFRESH_INTERVAL_MS = 30_000;

type HealthCardAutoRefreshProps = {
  initialHealth: DashboardHealthData;
};

function isDashboardHealthData(value: unknown): value is DashboardHealthData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DashboardHealthData>;

  return (
    (candidate.state === "healthy" || candidate.state === "unavailable") &&
    typeof candidate.statusText === "string" &&
    typeof candidate.checkedAt === "string"
  );
}

async function fetchHealth(signal?: AbortSignal) {
  const response = await fetch("/dashboard/health", {
    method: "GET",
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Health refresh failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  if (!isDashboardHealthData(payload)) {
    throw new Error("Health refresh returned an invalid payload.");
  }

  return payload;
}

export function HealthCardAutoRefresh({ initialHealth }: HealthCardAutoRefreshProps) {
  const [health, setHealth] = useState(initialHealth);

  useEffect(() => {
    setHealth(initialHealth);
  }, [initialHealth]);

  useEffect(() => {
    let isActive = true;
    let inFlightController: AbortController | null = null;

    const refresh = async () => {
      inFlightController?.abort();
      const controller = new AbortController();
      inFlightController = controller;

      try {
        const nextHealth = await fetchHealth(controller.signal);

        if (!isActive) {
          return;
        }

        setHealth(nextHealth);
      } catch {
        // Keep the latest known good state if a refresh fails.
      }
    };

    const intervalId = window.setInterval(() => {
      void refresh();
    }, HEALTH_REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      inFlightController?.abort();
    };
  }, []);

  return <HealthCard health={health} />;
}
