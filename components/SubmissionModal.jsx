import { Badge, Modal } from 'flowbite-react';

export default function SubmissionModal({ submission, open, onClose }) {
  if (!submission) return null;

  return (
    <Modal dismissible show={open} onClose={onClose}>
      <Modal.Header>Submission #{submission.id}</Modal.Header>
      <Modal.Body>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase text-slate-500">Submitted</p>
            <p className="font-semibold">{new Date(submission.created_at).toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-slate-500">IP Address</p>
              <p className="font-medium">{submission.ip_address}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Email</p>
              <p className="font-medium">{submission.email_submitted || submission.email_preview || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Referer</p>
              <p className="font-medium break-all">{submission.referer || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">User Agent</p>
              <p className="font-medium break-words">{submission.user_agent || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Detection Tags</p>
            <div className="flex flex-wrap gap-2">
              {(submission.detection_tags || ['clean']).map((tag) => (
                <Badge color={tag === 'honeypot-hit' ? 'failure' : 'info'} key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {submission.headers_json && (
            <div>
              <p className="text-xs uppercase text-slate-500">Headers</p>
              <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-lime-200">
                {JSON.stringify(submission.headers_json, null, 2)}
              </pre>
            </div>
          )}
          {submission.raw_body && (
            <div>
              <p className="text-xs uppercase text-slate-500">Body</p>
              <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                {submission.raw_body}
              </pre>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
