// ABOUTME: Service class for interacting with Zoom SDK APIs and handling events
// ABOUTME: Manages SDK initialization, participant tracking, speaker detection, and chat messaging

import zoomSdk from '@zoom/appssdk';

export interface ZoomParticipant {
  id: string;
  name: string;
  hasAudio: boolean;
}

export class ZoomService {
  private activeSpeakerListeners: ((speakers: string[]) => void)[] = [];
  private participantChangeListeners: ((participants: ZoomParticipant[]) => void)[] = [];
  private lastChatTime = 0;
  private chatRateLimit = 10000; // 10 seconds

  async initialize(): Promise<void> {
    try {
      await zoomSdk.config({
        version: '0.16.0',
        popoutSize: { width: 480, height: 720 },
        capabilities: ['onActiveSpeakerChange', 'onParticipantChange', 'postMessage', 'getRunningContext']
      });
      
      this.setupEventListeners();
    } catch (error) {
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Set up active speaker listener
    zoomSdk.onActiveSpeakerChange((event: any) => {
      const speakers = event.activeSpeakerUserGUIDs || [];
      this.activeSpeakerListeners.forEach(listener => listener(speakers));
    });

    // Set up participant change listener
    zoomSdk.onParticipantChange((event: any) => {
      const participants = this.mapParticipants(event.participants || []);
      this.participantChangeListeners.forEach(listener => listener(participants));
    });
  }

  async getParticipants(): Promise<ZoomParticipant[]> {
    try {
      await zoomSdk.getRunningContext();
      // For now, return empty array as listParticipants requires additional permissions
      return [];
    } catch {
      return [];
    }
  }

  private mapParticipants(rawParticipants: any[]): ZoomParticipant[] {
    return rawParticipants.map(p => ({
      id: p.userGUID,
      name: p.displayName,
      hasAudio: p.audio || false
    }));
  }

  onParticipantsChange(callback: (participants: ZoomParticipant[]) => void): void {
    this.participantChangeListeners.push(callback);
  }

  onActiveSpeakerChange(callback: (speakers: string[]) => void): void {
    this.activeSpeakerListeners.push(callback);
  }

  async postToChat(message: string): Promise<void> {
    const now = Date.now();
    if (now - this.lastChatTime < this.chatRateLimit) {
      // Rate limited - queue for later
      setTimeout(() => this.postToChat(message), this.chatRateLimit - (now - this.lastChatTime));
      return;
    }

    await zoomSdk.postMessage({
      message,
      to: 'all'
    });
    this.lastChatTime = now;
  }

  parseCommand(message: string): { command: string; args: string[] } | null {
    if (!message.startsWith('!')) return null;
    
    const parts = message.slice(1).split(' ');
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  async getMeetingContext(): Promise<any> {
    return await zoomSdk.getMeetingContext();
  }

  async isHost(): Promise<boolean> {
    const context = await this.getMeetingContext();
    return context.userRole === 'host';
  }
}