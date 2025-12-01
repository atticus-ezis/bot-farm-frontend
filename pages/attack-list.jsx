import ListResults from "@/components/ListResults";
import { attackCategoryFilter } from "@/config/filters";
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

  const detailComponentInfo = [
    { value: "created_at", label: "Timestamp" },
    { value: "category", label: "Category" },
    { value: "pattern", label: "Pattern" },
    { value: "request_path", label: "Request Path" },
    { value: "target_field", label: "Target Field" },
    { value: "raw_value", label: "Injection value" },
    { value: "full_value", label: "Full Value" },
  ];

  const filters = [attackCategoryFilter];

  return (
    <ListResults
      baseUrl={ATTACK_TYPES_URL}
      columns={columns}
      orderingOptions={orderingOptions}
      detailFields={detailComponentInfo}
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
