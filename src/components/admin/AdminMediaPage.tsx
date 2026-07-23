'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ImageIcon, Upload, FolderOpen, Plus, Trash2, Search, Eye, File
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  size: string;
  folder: string;
  uploadedAt: string;
}

interface MediaFolder {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

// Placeholder data for media management UI - will be replaced when file upload API is implemented
const placeholderMedia: MediaItem[] = [];
const placeholderFolders: MediaFolder[] = [];

export default function AdminMediaPage({ section }: { section?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const currentSection = section || null;

  // Upload view
  if (currentSection === 'upload') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6" />Upload Media</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Drag and drop files here</p>
              <p className="text-sm text-muted-foreground">or click to browse your files</p>
              <p className="text-xs text-muted-foreground mt-2">Supported: JPG, PNG, GIF, SVG, PDF, MP4 (Max 10MB)</p>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Target Folder</label>
              <select className="w-full p-2 border rounded-lg text-sm">
                <option>Homepage</option><option>Icons</option><option>Footer</option><option>SEO</option><option>Documents</option><option>Brand</option>
              </select>
            </div>
            <Button className="w-full"><Upload className="w-4 h-4 mr-2" />Upload Files</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Folders view
  if (currentSection === 'folders') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6" />Media Folders</h1>
          <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Folder</Button>
        </div>
        {placeholderFolders.length === 0 ? (
          <Card className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No media folders found. Create a folder to organize your files.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Folder Name</TableHead><TableHead>Files</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {placeholderFolders.map(folder => (
                    <TableRow key={folder.id}>
                      <TableCell className="font-medium flex items-center gap-2"><FolderOpen className="w-4 h-4 text-muted-foreground" />{folder.name}</TableCell>
                      <TableCell><Badge variant="secondary">{folder.count}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{folder.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Main media library view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6" />Media Library</h1>
          <p className="text-sm text-muted-foreground">Manage uploaded files and media assets</p>
        </div>
        <Button size="sm" className="gap-1"><Upload className="w-4 h-4" />Upload</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search media..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {placeholderMedia.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No media files uploaded yet. Upload files to start building your media library.</p>
        </Card>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {placeholderMedia.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="aspect-square rounded-lg bg-muted/30 flex items-center justify-center mb-2 overflow-hidden">
                  {item.type === 'image' ? (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <File className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
                <Badge variant="outline" className="text-xs mt-1">{item.folder}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
