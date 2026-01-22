import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Award, Eye, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const CertificatesList = () => {
  const { user } = useAuth();
  const { getUserCertificates, getCourse } = useCourses();

  const certificates = getUserCertificates(user?.id || 'user1');

  const handleDownload = (certId: string) => {
    toast.success('Certificate download started! (Demo)');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground">View and download your earned certificates</p>
        </div>

        {certificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const course = getCourse(cert.courseId);
              return (
                <Card key={cert.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all animate-fade-in">
                  <div className="h-32 gradient-hero relative flex items-center justify-center">
                    <Award className="h-16 w-16 text-primary-foreground/80" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display font-semibold mb-1 line-clamp-1">{cert.courseName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Issued on {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/certificate/${cert.id}`}><Eye className="h-4 w-4" /> View</Link>
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleDownload(cert.id)}>
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-6">Complete courses to earn certificates!</p>
            <Button asChild>
              <Link to="/courses"><BookOpen className="h-4 w-4" /> Browse Courses</Link>
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CertificatesList;
