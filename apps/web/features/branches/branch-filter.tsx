"use client";

import { createContext, useContext } from "react";

type Value = { branchId: string | null; setBranchId: (id: string | null) => void };

const BranchFilterContext = createContext<Value>({ branchId: null, setBranchId: () => {} });

export const BranchFilterProvider = BranchFilterContext.Provider;
export const useBranchFilter = () => useContext(BranchFilterContext);
