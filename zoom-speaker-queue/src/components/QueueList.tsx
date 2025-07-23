// ABOUTME: Component that displays the queue of upcoming speakers with drag-and-drop reordering
// ABOUTME: Shows participant status, position, and provides inline controls for each participant

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Participant } from '../types/participant';

interface QueueListProps {
  participants: Participant[];
  onReorder?: (ids: string[]) => void;
  onPause?: (id: string) => void;
  onRemove?: (id: string) => void;
}

interface SortableItemProps {
  participant: Participant;
  index: number;
  totalCount: number;
  onPause?: (id: string) => void;
  onRemove?: (id: string) => void;
  isUpNext: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  participant,
  index,
  totalCount,
  onPause,
  onRemove,
  isUpNext
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant.id });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    const items = Array.from(e.currentTarget.parentElement?.children || []) as HTMLElement[];
    const currentIndex = items.indexOf(e.currentTarget);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ariaLabel = `${participant.name}, position ${index + 1} of ${totalCount}, ${participant.status}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      role="listitem"
      tabIndex={0}
      draggable={true}
      data-dnd-kit-sortable
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`flex items-center justify-between p-3 rounded-lg ${
        participant.status === 'paused' 
          ? 'bg-gray-100 text-gray-500' 
          : isUpNext
          ? 'bg-blue-50 border-blue-300 border'
          : 'bg-white border border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          {...listeners}
          className="cursor-grab hover:cursor-grabbing touch-none"
          data-testid="drag-handle"
          aria-label="Drag to reorder"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="text-gray-400"
          >
            <path
              fill="currentColor"
              d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
            />
          </svg>
        </button>
        <span className="text-lg font-semibold text-gray-600">
          {index + 1}.
        </span>
        <span className={`font-medium ${
          participant.status === 'paused' ? 'line-through' : ''
        }`}>
          {participant.name}
        </span>
        {participant.status === 'paused' && (
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">⏸️ Paused</span>
        )}
        {isUpNext && participant.status !== 'paused' && (
          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Up Next</span>
        )}
      </div>
      
      <div className="flex gap-2">
        {onPause && (
          <button
            onClick={() => onPause(participant.id)}
            className="text-sm px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
            aria-label={participant.status === 'paused' ? `Resume ${participant.name}` : `Pause ${participant.name}`}
          >
            {participant.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(participant.id)}
            className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded"
          >
            Remove
          </button>
        )}
      </div>
    </li>
  );
};

export const QueueList: React.FC<QueueListProps> = ({
  participants,
  onReorder,
  onPause,
  onRemove
}) => {
  const upcomingParticipants = participants.filter(
    p => p.status === 'waiting' || p.status === 'paused'
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = upcomingParticipants.findIndex((p) => p.id === active.id);
      const newIndex = upcomingParticipants.findIndex((p) => p.id === over.id);
      
      const newOrder = arrayMove(upcomingParticipants, oldIndex, newIndex);
      const newIds = newOrder.map(p => p.id);
      
      if (onReorder) {
        onReorder(newIds);
      }
    }
  };

  if (upcomingParticipants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No participants in queue
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={upcomingParticipants.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2" role="list" aria-label="Speaker queue">
          {upcomingParticipants.map((participant, index) => (
            <SortableItem
              key={participant.id}
              participant={participant}
              index={index}
              totalCount={upcomingParticipants.length}
              onPause={onPause}
              onRemove={onRemove}
              isUpNext={index === 0}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};