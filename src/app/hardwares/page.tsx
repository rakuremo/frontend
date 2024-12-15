"use client"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableHardwares from "@/components/Tables/TableHardwares";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const Hardware = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Hardwares" />
      <TableHardwares />
    </DefaultLayout>
  );
};

export default Hardware;