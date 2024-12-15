"use client"
import TableHardwares from "@/components/Tables/TableHardwares";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { use, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function Home() {
  return (
    <>
      <DefaultLayout>
      <Breadcrumb pageName="Hardwares" />
        <TableHardwares />
      </DefaultLayout>
    </>
  );
}
