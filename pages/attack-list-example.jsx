import ListResults from "@/components/ListResults";
import { ATTACK_TYPES_URL } from "@/config/api";

export default function AttackListExample() {
  const columns = [
    { label: "Timestamp", key: "created_at", type: "date" },
    { label: "Category", key: "category" },
    { label: "Pattern", key: "pattern" },
    { label: "Request Path", key: "request_path" },
    { label: "Target Field", key: "target_field" },
  ];

  const orderingOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
  ];

  const filters = [
    {
      key: "category",
      label: "Category",
      defaultValue: "",
      options: [
        { value: "", label: "All" },
        { value: "XSS", label: "XSS" },
        { value: "SQLI", label: "SQL Injection" },
        { value: "LFI", label: "LFI" },
        { value: "CMD", label: "CMD" },
        { value: "TRAVERSAL", label: "TRAVERSAL" },
        { value: "SSTI", label: "SSTI" },
        { value: "Other", label: "Other" },
      ],
    },
  ];

  return (
    <ListResults
      baseUrl={ATTACK_TYPES_URL}
      columns={columns}
      orderingOptions={orderingOptions}
      filters={filters}
      title="All Attacks"
      description="Browse all Attacks with pagination"
      searchPlaceholder="Search by pattern, target field..."
      emptyMessage="No attacks found."
      loadingMessage="Loading attacks..."
      defaultOrdering="-created_at"
    />
  );
}
