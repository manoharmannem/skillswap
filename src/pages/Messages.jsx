import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function initialsOf(name) { return (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(); }
function formatTime(iso) { const d = new Date(iso); return d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" }); }

export default function Messages() {
  const { email: activeEmail } = useParams();
  const navigate = useNavigate();
  const { user, findUserByEmail } = useAuth();
  const { getConversations, getMessagesFor, sendMessage, getStatusWith, refreshMessageNotifications } = useConnections();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  async function loadConversations() { setConversations(await getConversations()); }

  useEffect(() => { loadConversations(); }, [user?.id]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.user?.email === activeEmail) || null,
    [conversations, activeEmail]
  );

  const activePerson = activeEmail ? findUserByEmail(activeEmail) : null;

  useEffect(() => {
    if (!activeConversation?.user?._id) { setMessages([]); return undefined; }
    let cancelled = false;
    const loadConversation = async () => {
      const next = await getMessagesFor(activeConversation.user._id);
      if (!cancelled) setMessages(next);
    };
    loadConversation();
    const interval = window.setInterval(loadConversation, 2500);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [activeConversation?.user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;

    const result = await sendMessage(activeConversation.user._id, text);
    if (result.error) { toast.error(result.error); return; }

    setDraft("");
    const next = await getMessagesFor(activeConversation.user._id);
    setMessages(next);
    await loadConversations();
    await refreshMessageNotifications();
  }

  const status = activeEmail ? getStatusWith(activeEmail).status : null;

  return (
    <div>
      <p className="page-eyebrow">Inbox</p>
      <h1 className="page-title">Messages</h1>
      <p className="page-sub">Message connected SkillSwap members and receive new messages across devices.</p>

      <div className="messages-shell panel" style={{ marginTop: "1.5rem" }}>
        <aside className="conversation-list">
          {conversations.length === 0 ? (
            <p className="empty-note">No conversations yet — connect with a member first.</p>
          ) : (
            conversations.map((conversation) => {
              const person = conversation.user;
              return (
                <button key={person._id} className={`conversation-item${person.email === activeEmail ? " active" : ""}`} onClick={() => navigate(`/dashboard/messages/${encodeURIComponent(person.email)}`)}>
                  <span className="avatar-fill ember-fill" style={{ width: "2.5rem", height: "2.5rem", fontSize: ".8rem" }}>{initialsOf(person.name)}</span>
                  <span className="conversation-item-body">
                    <span className="conversation-item-top">
                      <span className="conversation-item-name">{person.name}</span>
                      {conversation.lastMessage && <span className="conversation-item-time">{formatTime(conversation.lastMessage.createdAt)}</span>}
                    </span>
                    <span className="conversation-item-preview">{conversation.lastMessage?.message || "Say hello 👋"}</span>
                  </span>
                  {conversation.unreadCount > 0 && <span className="unread-dot" title="Unread messages">{conversation.unreadCount}</span>}
                </button>
              );
            })
          )}
        </aside>

        <section className="chat-area">
          {!activeEmail ? (
            <div className="chat-empty"><MessageCircle size={32} color="var(--faint-foreground)" /><p className="empty-note">Select a conversation.</p></div>
          ) : status !== "accepted" ? (
            <div className="chat-empty"><MessageCircle size={32} color="var(--faint-foreground)" /><p className="empty-note">Messaging is available after the connection is accepted.</p></div>
          ) : (
            <>
              <div className="chat-header">
                <div className="avatar-fill ember-fill" style={{ width: "2.5rem", height: "2.5rem" }}>{initialsOf(activePerson?.fullName || activeConversation?.user?.name)}</div>
                <div><p style={{ fontWeight: 600 }}>{activePerson?.fullName || activeConversation?.user?.name}</p><p className="list-row-sub">SkillSwap member</p></div>
              </div>

              <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 ? <p className="empty-note">No messages yet. Say hello 👋</p> : messages.map((message) => {
                  const mine = (message.sender?._id || message.sender) === user?.id;
                  return <div key={message._id} className={`chat-bubble ${mine ? "mine" : "theirs"}`}><p>{message.message}</p><span>{formatTime(message.createdAt)}</span></div>;
                })}
              </div>

              <form className="chat-compose" onSubmit={handleSend}>
                <input className="field-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" maxLength={2000} />
                <button className="btn btn-primary" type="submit" disabled={!draft.trim()}><Send size={16} /> Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
