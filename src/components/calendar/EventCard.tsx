// components/calendar/EventCard.tsx
import React from 'react';
import { format, isBefore } from 'date-fns';
import { Calendar, Clock, Users, Pencil, X, GripVertical } from 'lucide-react';
import { getColorForCategory } from '@/utils/calendarUtils';

interface EventCardProps {
  meeting: any;
  currentUserId: string;
  assignedByUserList: any[];
  onDragStart: (e: React.DragEvent, meeting: any) => void;
  onDragEnd: () => void;
  onEdit: (meeting: any) => void;
  onDelete: (meeting: any) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  meeting,
  currentUserId,
  assignedByUserList,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}) => {
  const isPastMeeting = isBefore(new Date(meeting.start), new Date());
  const isOwner = meeting.creator === currentUserId;
  const canDrag = isOwner && !isPastMeeting;
  const colorClass = getColorForCategory(meeting.category);

  return (
    <div
      key={meeting.id}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        onDragStart(e, meeting);
      }}
      onDragEnd={onDragEnd}
      className="group/event relative"
    >
      {/* Meeting pill */}
      <div
        className={`
          text-xs sm:text-sm dark:text-gray-100 text-gray-700 
          p-2 sm:p-3 rounded-md overflow-hidden whitespace-nowrap overflow-ellipsis 
          flex items-center space-x-1 ${colorClass} hover:opacity-80 transition-opacity
          ${canDrag ? 'cursor-move' : 'cursor-default'}
        `}
      >
        <GripVertical size={12} className="flex-shrink-0 opacity-70" />
        <span className="truncate">
          {format(new Date(meeting.start), 'ha')} {meeting.title}
        </span>
      </div>

      {/* Hover card */}
      <div
        className={`
          absolute w-full sm:w-72 lg:w-64 hidden group-hover/event:block z-50 top-full left-0 mt-1 
          p-3 sm:p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-xl 
          transform origin-top transition-all duration-200 scale-95 group-hover/event:scale-100 hover-card
        `}
      >
        <div className="space-y-2 sm:space-y-3">
          {/* Title & Category */}
          <div className="flex items-start justify-between">
            <h4 className="font-semibold dark:text-gray-100 text-gray-700 text-sm sm:text-base">{meeting.title}</h4>
            <div className={`px-2 py-1 rounded-full text-xs sm:text-sm ${colorClass} dark:text-gray-100 text-gray-700`}>
              {meeting.category}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
            <Calendar size={14} />
            <span>{format(new Date(meeting.start), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
            <Clock size={14} />
            <span>
              {format(new Date(meeting.start), 'h:mm a')} – {format(new Date(meeting.end), 'h:mm a')}
            </span>
          </div>

          {/* Description */}
          {meeting.description && (
            <div className="text-xs sm:text-sm text-gray-400 mt-2">
              <p className="line-clamp-3 sm:line-clamp-4">{meeting.description}</p>
            </div>
          )}

          {/* Attendees */}
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300 mb-1">
              <Users size={14} />
              <span className="font-medium">Attendees:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {meeting.attendees.slice(0, 3).map((_id: string) => {
                const user = assignedByUserList.find((u) => u._id === _id);
                return user ? (
                  <span
                    key={_id}
                    className="text-xs sm:text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                  >
                    {user.name}
                  </span>
                ) : null;
              })}
              {meeting.attendees.length > 3 && (
                <span className="text-xs sm:text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  +{meeting.attendees.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isOwner && !isPastMeeting && (
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(meeting);
                }}
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(meeting);
                }}
                className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
              >
                <X size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
