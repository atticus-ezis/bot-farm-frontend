// Filter definitions for ListResults component

export const attackCategoryFilter = {
  label: "Attack Category",
  key: "attack_categories",
  defaultValue: "",
  options: [
    { value: "", label: "All" },
    { value: "XSS", label: "XSS" },
    { value: "SQLI", label: "SQL Injection" },
    { value: "LFI", label: "LFI" },
    { value: "CMD", label: "CMD" },
    { value: "TRAVERSAL", label: "TRAVERSAL" },
    { value: "SSTI", label: "SSTI" },
    { value: "OTHER", label: "Other" },
  ],
};

export const methodFilter = {
  label: "Method",
  key: "method",
  defaultValue: "",
  options: [
    { value: "", label: "All" },
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "PATCH", label: "PATCH" },
    { value: "DELETE", label: "DELETE" },
  ],
};

export const attackAttemptedFilter = {
  label: "Attack Attempted",
  key: "attack_attempted",
  defaultValue: "",
  options: [
    { value: "", label: "All" },
    { value: "True", label: "Yes" },
    { value: "False", label: "No" },
  ],
};

// Pre-configured filter arrays for common use cases
