import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { 
  fetchDiscussionsByIEP, 
  createDiscussionComment, 
  createDiscussionReply 
} from '../../APIsServices/DiscussionAPI';
import UserMentionPicker from './UserMentionPicker';
import { DiscussionSidebarProps, Comment } from '../../types/DiscussionSidebarProps';
import Loader from '../../Common/Loader';

// Placeholder UserMentionPicker component
// const UserMentionPicker: React.FC<{
//   sp: any;
//   onUsersSelected: (users: any[]) => void;
//   selectedUsers: any[];
// }> = ({ sp, onUsersSelected, selectedUsers }) => {
//   return (
//     <div className="mb-2">
//       <input
//         type="text"
//         className="form-control form-control-sm"
//         placeholder="@mention users..."
//         style={{ fontSize: '0.85rem' }}
//       />
//     </div>
//   );
// };

const DiscussionSidebar: React.FC<DiscussionSidebarProps> = ({ 
  sp, 
  iepId, 
  departmentId,
  currentUser,
  isMobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [discussions, setDiscussions] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [mentionedUsers, setMentionedUsers] = useState<any[]>([]);
  const [showResolved, setShowResolved] = useState(false);

  /* Quill toolbar configuration */
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };
  const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet'];

  useEffect(() => {
    if (isOpen && sp && iepId && departmentId) {
      loadDiscussions();
    }
  }, [isOpen, sp, iepId, departmentId]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = await fetchDiscussionsByIEP(sp, iepId, departmentId, currentUser?.Id);
      console.log(data,'data>>>>');
      
      // Organize comments with their replies
      const topLevelComments = data.filter((c: Comment) => !c.ParentCommentId);
      const organized = topLevelComments.map((comment: Comment) => ({
        ...comment,
        replies: data.filter((c: Comment) => c.ParentCommentId === comment.Id)
      }));
      
      setDiscussions(organized);
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createDiscussionComment(sp, {
        IEPId: iepId,
        DepartmentId: departmentId,
        Comment: newComment,
        MentionedUserIds: mentionedUsers.map(u => u.id)
      });
      
      setNewComment('');
      setMentionedUsers([]);
      await loadDiscussions();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      const is401 = String(error?.message || error).includes('401');
      if (is401) {
        window.location.reload();
        return;
      }
      toast.error('Failed to add comment. Please try again.');
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    try {
      console.log('Adding reply with data:', {
        IEPId: iepId,
        DepartmentId: departmentId,
        Comment: replyText,
        ParentCommentId: parentId,
        MentionedUsersIds: mentionedUsers.map(u => u.id)
      });

      await createDiscussionReply(sp, {
        IEPId: iepId,
        DepartmentId: departmentId,
        Comment: replyText,
        ParentCommentId: parentId,
        MentionedUsersIds: mentionedUsers.map(u => u.id)
      });
      
      setReplyText('');
      setReplyingTo(null);
      setMentionedUsers([]);
      await loadDiscussions();
    } catch (error: any) {
      console.error('Error adding reply:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      const is401 = String(error?.message || error).includes('401');
      if (is401) {
        window.location.reload();
        return;
      }
      toast.error(`Failed to add reply: ${error.message || 'An unexpected error occurred.'}`);
    }
  };

  const toggleComment = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isExpanded = expandedComments.has(comment.Id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div 
        key={comment.Id} 
        className={`mb-3 ${isReply ? 'ms-4' : ''}`}
        style={{ 
          borderLeft: isReply ? '2px solid #e9ecef' : 'none',
          paddingLeft: isReply ? '12px' : '0'
        }}
      >
        <div className="d-flex gap-2">
          <div 
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ 
              width: isReply ? '28px' : '32px', 
              height: isReply ? '28px' : '32px',
              fontSize: isReply ? '11px' : '12px',
              flexShrink: 0
            }}
          >
            {comment.Author?.Title?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div>
                <strong style={{ fontSize: isReply ? '0.85rem' : '0.9rem' }}>
                  {comment.Author?.Title || 'Unknown'}
                </strong>
                <span className="text-muted ms-2" style={{ fontSize: '0.75rem' }}>
                  {formatDate(comment.Created)}
                </span>
              </div>
            </div>
            
            <div 
              className="mb-2" 
              style={{ 
                fontSize: isReply ? '0.85rem' : '0.9rem',
                lineHeight: 1.5
              }}
              dangerouslySetInnerHTML={{ __html: comment.Comment }}
            />

            {!isReply && (
              <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                <button  type="button"
                  className="btn btn-link p-0 text-muted"
                  onClick={() => {
                    setReplyingTo(comment.Id);
                  }}
                  style={{ fontSize: '0.75rem' }}
                >
                  Reply
                </button>
                {hasReplies && (
                  <button type='button'
                    className="btn btn-link p-0 text-muted"
                    onClick={() => toggleComment(comment.Id)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={14} className="me-1" />
                        Hide {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} className="me-1" />
                        Show {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === comment.Id && (
              <div className="mt-3">
                <UserMentionPicker
                  sp={sp}
                  onUsersSelected={setMentionedUsers}
                  selectedUsers={mentionedUsers}
                />
                <ReactQuill
                  value={replyText}
                  onChange={(v) => setReplyText(v)}
                  theme="snow"
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write a reply..."
                  style={{ fontSize: '0.85rem' }}
                />
                <div className="d-flex gap-2 mt-2">
                  <button  type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddReply(comment.Id)}
                    disabled={!replyText.trim()}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Send size={12} className="me-1" />
                    Reply
                  </button>
                  <button  type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                      setMentionedUsers([]);
                    }}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {hasReplies && isExpanded && (
              <div className="mt-3">
                {comment.replies?.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Icon Button */}
      {!isOpen && (
        <button type="button"
          className="btn btn-primary rounded-circle position-fixed shadow-lg"
          onClick={() => setIsOpen(true)}
          style={{
            right: isMobile ? '15px' : '30px',
            bottom: isMobile ? '15px' : '30px',
            width: isMobile ? '50px' : '60px',
            height: isMobile ? '50px' : '60px',
            zIndex: 1000,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Open Discussion"
        >
          <MessageSquare size={isMobile ? 20 : 24} />
        </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <div
          className="position-fixed bg-white shadow-lg border-start d-flex flex-column"
          style={{
            right: 0,
            top: 0,
            bottom: 0,
            width: isMobile ? '100%' : '400px',
            zIndex: 1050,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {/* Header */}
          <div 
            className="d-flex justify-content-between align-items-center p-3 border-bottom"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <div className="d-flex align-items-center gap-2">
              <MessageSquare size={20} />
              <h5 className="mb-0" style={{ fontSize: '1rem' }}>Discussion</h5>
            </div>
            <button type="button"
              className="btn btn-link text-dark p-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-grow-1 overflow-auto p-3">
            {loading ? (
              <div className="text-center py-5">
                <Loader size="small" />
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center text-muted py-5">
                <MessageSquare size={48} className="mb-3 opacity-25" />
                <p style={{ fontSize: '0.9rem' }}>No discussions yet</p>
                <p style={{ fontSize: '0.8rem' }}>Start a conversation below</p>
              </div>
            ) : (
              discussions.map(comment => renderComment(comment))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-top p-3" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="mb-2">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Notify colleagues with @mentions.
              </label>
              <UserMentionPicker
                sp={sp}
                onUsersSelected={setMentionedUsers}
                selectedUsers={mentionedUsers}
              />
            </div>
            
            {/* ReactQuill Rich Text Editor */}
            <div className="mb-2">
              <ReactQuill
                value={newComment}
                onChange={setNewComment}
                theme="snow"
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write a comment..."
                style={{ 
                  backgroundColor: 'white',
                  minHeight: '100px'
                }}
              />
            </div>
            
            <button type='button'
              className="btn btn-primary w-100"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={16} className="me-2" />
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && !isMobile && (
        <div
          className="position-fixed"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1049
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DiscussionSidebar;
