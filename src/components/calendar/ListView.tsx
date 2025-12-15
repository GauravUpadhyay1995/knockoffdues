// components/calendar/ListView.tsx
import React from 'react';
import { format, isBefore } from 'date-fns';
import { GripVertical, Pencil, X, Users } from 'lucide-react';

interface ListViewProps {
  visibleMeetings: any[];
  currentUserId: string;
  assignedByUserList: any[];
  onDragStart: (e: React.DragEvent, meeting: any) => void;
  onDragEnd: () => void;
  onEditEvent: (meeting: any) => void;
  onDeleteEvent: (meeting: any) => void;
}

const ListView: React.FC<ListViewProps> = ({
  visibleMeetings,
  currentUserId,
  assignedByUserList,
  onDragStart,
  onDragEnd,
  onEditEvent,
  onDeleteEvent,
}) => {
  const sortedMeetings = [...visibleMeetings].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const now = new Date();

  return (
    <div className="flex flex-col flex-grow overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Upcoming Meetings</h2>
      <div className="space-y-3">
        {sortedMeetings.length > 0 ? (
          sortedMeetings.map((meeting) => {
            const isPastMeeting = isBefore(new Date(meeting.start), now);
            const isOwner = meeting.creator === currentUserId;

            return (
              <div
                key={meeting.id}
                draggable={isOwner && !isPastMeeting}
                onDragStart={e => !isPastMeeting && onDragStart(e, meeting)}
                onDragEnd={onDragEnd}
                className={`flex flex-col sm:flex-row items-start p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${
                  meeting.color
                } ${isPastMeeting ? 'opacity-60' : 'cursor-move'}`}
              >
                {!isPastMeeting && (
                  <GripVertical size={16} className="flex-shrink-0 opacity-70 mr-3 mt-1" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-0">
                      <span>{format(new Date(meeting.start), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(meeting.start), 'h:mm a')} -{' '}
                        {format(new Date(meeting.end), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {meeting.description}
                    </p>
                  )}

                  <div className="flex items-center flex-wrap gap-2">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Attendees:
                    </span>
                    {meeting.attendees.slice(0, 3).map((id: string) => {
                      const user = assignedByUserList.find(u => u._id === id);
                      return user ? (
                        <span
                          key={id}
                          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          {user.name}
                        </span>
                      ) : null;
                    })}
                    {meeting.attendees.length > 3 && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        +{meeting.attendees.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {isOwner && !isPastMeeting && (
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0 sm:ml-4">
                
                    <button
                      onClick={() => onEditEvent(meeting)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit event"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(meeting)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Delete event"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            No upcoming meetings.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;