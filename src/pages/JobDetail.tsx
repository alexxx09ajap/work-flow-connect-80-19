
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle, Bookmark, BookmarkCheck, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { jobService } from '@/lib/jobService';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { refreshJobs, savedJobs, saveJob, unsaveJob } = useJobs();
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const { createPrivateChat } = useChat();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [jobOwner, setJobOwner] = useState<any>(null);

  // Load job details
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        
        if (jobData) {
          setJob(jobData);
          
          // Check if current user is the owner
          if (currentUser && jobData.userId === currentUser.id) {
            setIsOwner(true);
          }
          
          // Get job owner details
          const owner = await getUserById(jobData.userId);
          if (owner) {
            setJobOwner(owner);
          }
          
          // Check if job is saved by current user
          if (currentUser && savedJobs) {
            const saved = savedJobs.some(savedJob => savedJob.id === jobData.id);
            setIsSaved(saved);
          }
        }
      } catch (error) {
        console.error("Error loading job:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información de la propuesta."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [jobId, currentUser, savedJobs, getUserById]);

  const handleToggleSave = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para guardar propuestas."
      });
      return;
    }
    
    try {
      if (isSaved) {
        await unsaveJob(jobId || "");
      } else {
        await saveJob(jobId || "");
      }
      
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling save status:", error);
    }
  };

  const handleContactFreelancer = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para contactar al usuario."
      });
      return;
    }
    
    if (jobOwner) {
      try {
        await createPrivateChat(jobOwner.id);
        navigate('/chats');
      } catch (error) {
        console.error("Error creating chat:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo iniciar la conversación."
        });
      }
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para comentar."
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El comentario no puede estar vacío."
      });
      return;
    }
    
    try {
      await jobService.addComment(jobId || "", commentText);
      
      // Refresh job to load new comment
      const updatedJob = await jobService.getJobById(jobId || "");
      if (updatedJob) {
        setJob(updatedJob);
      }
      
      setCommentText("");
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha publicado correctamente."
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el comentario."
      });
    }
  };
  
  const handleEditJob = () => {
    navigate(`/profile`);
  };
  
  const handleDeleteJob = async () => {
    try {
      await jobService.deleteJob(jobId || "");
      toast({
        title: "Propuesta eliminada",
        description: "La propuesta ha sido eliminada correctamente."
      });
      navigate('/jobs');
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la propuesta."
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Cargando propuesta...</p>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">Propuesta no encontrada</h2>
                <p className="text-gray-500 dark:text-gray-400">La propuesta que buscas no existe o ha sido eliminada.</p>
                <Button onClick={() => navigate('/jobs')} className="mt-4">
                  Volver a las propuestas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="w-full mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">{job.title}</h1>
                <Badge className="mt-1">{job.category}</Badge>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Presupuesto: ${job.budget} USD
                </p>
              </div>
              
              <div className="flex space-x-2">
                {isOwner ? (
                  <>
                    <Button variant="outline" onClick={handleEditJob} className="flex items-center">
                      <Edit size={16} className="mr-1" /> Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center">
                          <Trash2 size={16} className="mr-1" /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta propuesta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteJob}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleToggleSave}
                    className="flex items-center"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck size={16} className="mr-1 text-green-500" /> Guardado
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} className="mr-1" /> Guardar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills && job.skills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="dark:bg-gray-700 dark:text-white">
                  {skill}
                </Badge>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Descripción</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
            </div>

            <Separator className="my-4" />

            <div>
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Detalles del Cliente</h2>
              {jobOwner ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={jobOwner.photoURL} alt={jobOwner.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {jobOwner.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold dark:text-white">{jobOwner.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{jobOwner.email}</p>
                    {currentUser && currentUser.id !== jobOwner.id && (
                      <Button onClick={handleContactFreelancer} size="sm" className="mt-2">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contactar
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Información del cliente no disponible.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col p-6 border-t">
            <h3 className="text-lg font-semibold w-full text-left mb-4 dark:text-white">Comentarios</h3>
            
            {job.comments && job.comments.length > 0 ? (
              <div className="space-y-4 w-full mb-4">
                {job.comments.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user?.photoURL} />
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                          {comment.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm dark:text-white">{comment.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">No hay comentarios aún.</p>
            )}
            
            {currentUser && (
              <div className="w-full">
                <Textarea
                  placeholder="Escribe tu comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <Button onClick={handleSubmitComment} className="w-full sm:w-auto">
                  Enviar <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
