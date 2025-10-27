import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Vote, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Competition {
  id: string;
  name: string;
  description: string;
  votingStartTime: string;
  votingEndTime: string;
  totalVotes: number;
  isActive: boolean;
  options: {
    id: string;
    name: string;
    voteCount: number;
    percentage: number;
  }[];
}

interface VotingPanelProps {
  competition?: Competition;
  onVote?: (optionId: string) => void;
  hasVoted?: boolean;
  userVote?: string;
}

export const VotingPanel = ({
  competition,
  onVote,
  hasVoted = false,
  userVote
}: VotingPanelProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  if (!competition) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active competition</p>
        </div>
      </Card>
    );
  }

  const handleVote = async () => {
    if (!selectedOption) {
      toast({
        title: "No Selection",
        description: "Please select an option to vote.",
        variant: "destructive",
      });
      return;
    }

    if (hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already voted in this competition.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      await onVote?.(selectedOption);
      toast({
        title: "Vote Submitted!",
        description: "Your vote has been recorded on the blockchain.",
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const isVotingActive = competition.isActive && new Date() < new Date(competition.votingEndTime);
  const timeRemaining = new Date(competition.votingEndTime).getTime() - Date.now();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {competition.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {competition.description}
            </p>
          </div>
          <Badge variant={isVotingActive ? "default" : "secondary"}>
            {isVotingActive ? "Active" : "Ended"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {competition.totalVotes} votes
          </div>
          {isVotingActive && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {hoursRemaining}h {minutesRemaining}m left
            </div>
          )}
        </div>

        <Tabs defaultValue="vote" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="vote" className="space-y-3">
            {hasVoted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium">You have voted</p>
                <p className="text-sm text-muted-foreground">
                  Your vote: {competition.options.find(o => o.id === userVote)?.name}
                </p>
              </div>
            ) : isVotingActive ? (
              <div className="space-y-3">
                {competition.options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.name}</span>
                      <Vote className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleVote}
                  disabled={!selectedOption || isVoting}
                  className="w-full"
                >
                  {isVoting ? "Submitting..." : "Submit Vote"}
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                Voting has ended for this competition.
              </p>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-3">
            {competition.options
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      {index === 0 && option.voteCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          🏆 Leading
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {option.voteCount} votes ({option.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};