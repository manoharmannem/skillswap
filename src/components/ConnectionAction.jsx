import { useNavigate } from "react-router-dom";
import { UserPlus, Check, X, MessageCircle, Clock } from "lucide-react";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ConnectionAction({ email, size = "md" }) {
  const { getStatusWith, sendRequest, acceptRequest, rejectRequest, cancelRequest } = useConnections();
  const toast = useToast();
  const navigate = useNavigate();
  const btnSize = size === "sm" ? "btn-sm" : "";
  const { status, connection } = getStatusWith(email);

  async function run(action, message) { const result = await action; if (result.error) toast.error(result.error); else toast.success(message); }
  if (status === "self") return null;
  if (status === "accepted") return <button className={`btn btn-primary ${btnSize}`} onClick={() => navigate(`/dashboard/messages/${encodeURIComponent(email)}`)}><MessageCircle size={16} /> Message</button>;
  if (status === "pending_received") return <div style={{ display: "flex", gap: "0.5rem" }}><button className={`btn btn-primary ${btnSize}`} onClick={() => run(acceptRequest(connection.id), "Connection accepted")}><Check size={16} /> Accept</button><button className={`btn btn-danger ${btnSize}`} onClick={() => run(rejectRequest(connection.id), "Request declined")}><X size={16} /> Reject</button></div>;
  if (status === "pending_sent") return <button className={`btn btn-secondary ${btnSize}`} onClick={() => run(cancelRequest(connection.id), "Request cancelled")}><Clock size={16} /> Request Sent</button>;
  return <button className={`btn btn-secondary ${btnSize}`} onClick={() => run(sendRequest(email), "Connection request sent")}><UserPlus size={16} /> Connect</button>;
}
