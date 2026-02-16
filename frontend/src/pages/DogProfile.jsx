import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";

export const DogProfile = ({ user }) => {
  const { dogId } = useParams();

  return (
    <AppLayout user={user}>
      {({ dogs }) => {
        const dog = dogs.find(d => d.dog_id === dogId);
        
        if (!dog) {
          return (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Dog not found</p>
            </div>
          );
        }

        return (
          <div className="animate-fade-in" data-testid="dog-profile">
            <h1 className="font-heading font-bold text-2xl">{dog.name}'s Profile</h1>
            {/* Profile content can be expanded */}
          </div>
        );
      }}
    </AppLayout>
  );
};

export default DogProfile;
