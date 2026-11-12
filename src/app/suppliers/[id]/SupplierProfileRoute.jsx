
"use client";

import { useParams } from "next/navigation";
import SupplierProfileContent from "./SupplierProfileContent";

export default function SupplierProfileRoute() {
  const params = useParams();

  return (
    <SupplierProfileContent supplierId={params.id} />
  );
}
