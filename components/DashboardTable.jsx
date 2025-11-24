import { Badge, Table } from "flowbite-react";

const statusColor = (tag) => {
  if (tag === "honeypot-hit") return "failure";
  if (tag === "clean") return "gray";
  return "info";
};

export default function DashboardTable({ submissions = [], onSelect }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Timestamp</Table.HeadCell>
          <Table.HeadCell>IP</Table.HeadCell>
          <Table.HeadCell>Email</Table.HeadCell>
          <Table.HeadCell>User Agent</Table.HeadCell>
          <Table.HeadCell>Tags</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {submissions.map((submission) => (
            <Table.Row className="cursor-pointer bg-white" key={submission.id} onClick={() => onSelect?.(submission)}>
              <Table.Cell className="font-medium">{new Date(submission.created_at).toLocaleString()}</Table.Cell>
              <Table.Cell>{submission.ip_address}</Table.Cell>
              <Table.Cell>{submission.email || "—"}</Table.Cell>
              <Table.Cell>{submission.agent?.slice(0, 50) || "—"}</Table.Cell>
              <Table.Cell className="space-x-2">
                {submission.attack_attempted && <Badge color="failure">attack</Badge>}
                {submission.attack_categories?.map((cat) => (
                  <Badge key={`${submission.id}-${cat}`} color="info">
                    {cat}
                  </Badge>
                ))}
                {!submission.attack_attempted &&
                  (!submission.attack_categories || submission.attack_categories.length === 0) && (
                    <Badge color="gray">clean</Badge>
                  )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {submissions.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No submissions yet.</p>}
    </div>
  );
}
