import { Badge, Table } from "flowbite-react";

const statusColor = (tag) => {
  if (tag === "honeypot-hit") return "failure";
  if (tag === "clean") return "gray";
  return "info";
};
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const detailView = `${API_BASE}/bot-events/`;

export default function DashboardTable({ submissions = [], onSelect }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow">
      {/* values:
            "id",
            "created_at",
            "method",
            "request_path",
            "ip_address",  # IPAnalyticsListSerializer filter on ip_address
            "attack_count",  # AttackTypeList filter on bot_event_id
            "attack_categories",
            "attack_attempted" # add color theme to row for conditional
      */}
      {/* onSelect(submission) 
      link to /api/bot-events/{pk} on same page
      
      */}
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Timestamp</Table.HeadCell>
          <Table.HeadCell>IP Address</Table.HeadCell>
          <Table.HeadCell>Path</Table.HeadCell>
          <Table.HeadCell>Method</Table.HeadCell>
          <Table.HeadCell>Attacks</Table.HeadCell>
          <Table.HeadCell>Attack Count</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {submissions.map((submission) => (
            <Table.Row
              className="cursor-pointer bg-white"
              key={submission.id}
              onClick={() => fetch(`${detailView}${submission.id}/`)}
            >
              <Table.Cell className="font-medium">{new Date(submission.created_at).toLocaleString()}</Table.Cell>
              <Table.Cell>{submission.ip_address}</Table.Cell>
              <Table.Cell>{submission.request_path}</Table.Cell>
              <Table.Cell>{submission.method}</Table.Cell>
              <Table.Cell className="space-x-2">
                {/* {submission.attack_attempted && <Badge color="failure">attack</Badge>} */}
                {submission.attack_categories?.map((cat) => (
                  <Badge key={`${submission.id}-${cat}`} color="info">
                    {cat}
                  </Badge>
                ))}
                {!submission.attack_attempted &&
                  (!submission.attack_categories || submission.attack_categories.length === 0) && (
                    <Badge color="gray">none</Badge>
                  )}
              </Table.Cell>
              <Table.Cell>{submission.attack_count}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {submissions.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No submissions yet.</p>}
    </div>
  );
}
