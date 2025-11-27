import { Badge } from "flowbite-react";

/**
 * Factory function that creates a detail component based on configuration.
 *
 * @param {Array} detailComponentInfo - Array of field configurations
 * @param {string} detailComponentInfo[].value - The key to access in the row data
 * @param {string} detailComponentInfo[].label - The display label for the field
 * @param {string} [detailComponentInfo[].type] - Optional type: "date", "json", "array", "boolean"
 * @returns {Function} A React component that displays row details
 */
export default function DetailComponent(detailComponentInfo = []) {
  return function RowDetail({ row, onClose }) {
    if (!row) return null;

    const renderFieldValue = (field) => {
      const { value: key, type } = field;
      const data = row[key];

      if (data === null || data === undefined) {
        return "—";
      }

      switch (type) {
        case "date":
          return new Date(data).toLocaleString();

        case "json":
          return (
            <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-lime-200">
              {JSON.stringify(data, null, 2)}
            </pre>
          );

        case "array":
          if (Array.isArray(data)) {
            if (data.length === 0) return "—";
            return (
              <div className="flex flex-wrap gap-1">
                {data.map((item, idx) => (
                  <Badge key={idx} color="info">
                    {String(item)}
                  </Badge>
                ))}
              </div>
            );
          }
          return String(data);

        case "boolean":
          return <Badge color={data ? "failure" : "success"}>{data ? "Yes" : "No"}</Badge>;

        default:
          // Handle arrays that aren't explicitly typed
          if (Array.isArray(data)) {
            return data.join(", ");
          }
          return String(data);
      }
    };

    return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          {detailComponentInfo.map((field) => {
            const value = renderFieldValue(field);
            const isComplexValue = typeof value === "object" && value !== null && !Array.isArray(value);

            return (
              <div key={field.value} className={field.type === "json" ? "col-span-2" : ""}>
                <p className="text-xs uppercase text-slate-500 mb-1">{field.label}</p>
                {isComplexValue ? (
                  value
                ) : (
                  <p className={`font-medium ${field.type === "json" ? "" : "break-all"}`}>{value}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional fields that might not be in detailComponentInfo */}
        {row.attack_categories && row.attack_categories.length > 0 && (
          <div>
            <p className="text-xs uppercase text-slate-500 mb-2">Attack Categories</p>
            <div className="flex flex-wrap gap-2">
              {row.attack_categories.map((cat) => (
                <Badge key={cat} color="info">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {row.attack_count !== undefined && (
          <div>
            <p className="text-xs uppercase text-slate-500">Attack Count</p>
            <p className="font-medium">{row.attack_count}</p>
          </div>
        )}
      </div>
    );
  };
}
