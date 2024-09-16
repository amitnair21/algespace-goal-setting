
using webapi.Models.Flexibility;
using webapi.Models.Math;

namespace webapi.Data.Examples
{
    public class MatchingExamples
    {
        public static List<ExtendedMatchingExercise> GetExamples()
        {
            ExtendedMatchingExercise equalization1 = new()
            {
                Id = 1,
                Ordering = 1,
                FirstEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(1), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient("1/2"), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(2) }
                    ]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(1), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient(3) },
                        new() { Coefficient = new Coefficient("-3/2"), Variable = Identifier.X }
                    ]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.Second,
                SecondEquationIsIsolatedIn = IsolatedIn.Second,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient("1/2") },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient("9/4") },
                Method = Method.Equalization,
                AlternativeSystems = [
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(1), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(2) }]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms = [ new() { Coefficient = new Coefficient(1), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(1), Variable = Identifier.Y },
                                new() { Coefficient = new Coefficient("1/2") }
                            ],
                        },
                    },
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(1), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(-2), Variable = Identifier.Y }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(10) }]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(2), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(5) }]
                        },
                    }
                ],
                SelfExplanationTask = new ExtendedSelfExplanation()
                {
                    Method = Method.Equalization,
                    IsSingleChoice = false,
                    Options = new List<ExtendedOption> {
                        new(){
                            TextDE = "Das ausgewählte System muss nur einmal umgeformt werden.",
                            TextEN = "The selected system only needs to be transformed once.",
                            ReasonDE = "Das System muss nicht umgeformt werden, um das Verfahren anwenden zu können.",
                            ReasonEN = "The system does not need to be remodelled in order to use the method.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Die beiden anderen Systeme müssten zunächst umgeformt werden, um das Verfahren anwenden zu können.",
                            TextEN = "The other two systems would first have to be transformed in order to be able to use the method.",
                            IsSolution = true
                        },
                        new(){
                            TextDE = "Das Verfahren könnte auch direkt auf die anderen beiden Systeme angewendet werden, allerdings sind diese komplizierter.",
                            TextEN = "The method could also be applied directly to the other two systems, but these are more complicated.",
                            ReasonDE = "Das Verfahren kann nicht direkt auf die anderen Systeme angewendet werden.",
                            ReasonEN = "The method cannot be applied directly to the other systems.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Beide Gleichungen sind bereits nach y aufgelöst. Somit kann das Verfahren direkt angewendet werden.",
                            TextEN = "Both equations are already solved for y. The method can therefore be used directly.",
                            IsSolution = true
                        }
                    }
                },
                AgentMessageForSelfExplanationDE = "Beim Erklären überlegst du dir die besten Lösungswege, was deine Problemlösungsfähigkeiten stärkt.",
                AgentMessageForSelfExplanationEN = "When explaining, you think about the best solutions, which strengthens your problem-solving skills.",
                AgentMessageForFirstSolutionDE = "Wenn du regelmäßig von Hand rechnest, erweiterst und verbesserst du deine mathematischen Fertigkeiten kontinuierlich.",
                AgentMessageForFirstSolutionEN = "If you regularly calculate by hand, you will continuously expand and improve your maths skills.",
                AgentMessageForSecondSolutionDE = "Viele alltägliche Probleme erfordern grundlegende mathematische Kenntnisse, die du durch manuelles Rechnen vertiefst.",
                AgentMessageForSecondSolutionEN = "Many everyday problems require basic mathematical knowledge, which you will deepen through manual calculation.",
            };

            ExtendedMatchingExercise elimination1 = new()
            {
                Id = 2,
                Ordering = 2,
                FirstEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(7), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(10), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(3) }]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(2), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(5), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(3) }]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.None,
                SecondEquationIsIsolatedIn = IsolatedIn.None,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(-1) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(1) },
                Method = Method.Elimination,
                AlternativeSystems = [
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient("1/3"), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(1) }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient("1/8"), Variable = Identifier.Y }]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient("1/2"), Variable = Identifier.Y },
                                new() { Coefficient = new Coefficient(-1) }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient("1/6"), Variable = Identifier.X }]
                        },
                    },
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient("1/2"), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(6), Variable = Identifier.Y },
                                new() { Coefficient = new Coefficient("-2/5") }
                            ],
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(5), Variable = Identifier.Y }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(2), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient("1/3") }
                            ],
                        },
                    }
                ],
                SelfExplanationTask = new ExtendedSelfExplanation()
                {
                    Method = Method.Elimination,
                    IsSingleChoice = false,
                    Options = new List<ExtendedOption> {
                        new(){
                            TextDE = "Egal, wie man addiert oder subtrahiert, man kann in den anderen beiden Systemen ohne eine Umformung mit dem Additionsverfahren keine Variable eliminieren.",
                            TextEN = "No matter how you add or subtract, you cannot eliminate a variable in the other two systems without a transformation using the addition method.",
                            IsSolution = true
                        },
                        new(){
                            TextDE = "Multipliziert man die zweite Gleichung mit dem Faktor 2, kann man die Variable y durch Subtrahieren der Gleichungen eliminieren.",
                            TextEN = "If you multiply the second equation by a factor of 2, you can eliminate the variable y by subtracting the equations.",
                            IsSolution = true
                        },
                        new(){
                            TextDE = "Das Verfahren könnte auch direkt auf die anderen beiden Systeme angewendet werden, allerdings sind diese komplizierter.",
                            TextEN = "The method could also be applied directly to the other two systems, but these are more complicated.",
                            ReasonDE = "Das Verfahren kann nicht direkt auf die anderen Systeme angewendet werden.",
                            ReasonEN = "The method cannot be applied directly to the other systems.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Das gewählte System kann als einziges mit dem Additionsverfahren gelöst werden.",
                            TextEN = "The selected system is the only one that can be solved using the addition method.",
                            ReasonDE = "Die anderen Systeme können ebenfalls mit dem Verfahren gelöst werden, müssen aber zunächst umgeformt werden.",
                            ReasonEN = "The other systems can also be solved using the method, but must first be transformed.",
                            IsSolution = false
                        }
                    }
                },
                AgentMessageForSelfExplanationDE = "Wenn du deine Lösungswege erklärst, erkennst du mögliche Fehler leichter und kannst sie korrigieren.",
                AgentMessageForSelfExplanationEN = "If you explain your solutions, you will recognise possible mistakes more easily and can correct them.",
                AgentMessageForFirstSolutionDE = "Computer machen manchmal Fehler oder werden falsch bedient. Wenn du regelmäßig von Hand rechnest, kannst du solche Fehler leicht erkennen und korrigieren.",
                AgentMessageForFirstSolutionEN = "Computers sometimes make mistakes or are operated incorrectly. If you regularly calculate by hand, you can easily recognise and correct such errors.",
                AgentMessageForSecondSolutionDE = "Wenn du regelmäßig von Hand rechnest, wirst du schneller und effizienter im Lösen von Aufgaben.",
                AgentMessageForSecondSolutionEN = "If you regularly calculate by hand, you will become faster and more efficient at solving tasks.",
            };

            ExtendedMatchingExercise substitution1 = new()
            {
                Id = 3,
                Ordering = 3,
                FirstEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(1), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient(3) },
                        new() { Coefficient = new Coefficient("5/2"), Variable = Identifier.X }
                    ]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(1), Variable = Identifier.X }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient("9/2") },
                        new() { Coefficient = new Coefficient("-3/2"), Variable = Identifier.Y }
                    ]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.Second,
                SecondEquationIsIsolatedIn = IsolatedIn.First,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(0) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(3) },
                Method = Method.Substitution,
                AlternativeSystems = [
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(6) },
                                new() { Coefficient = new Coefficient(5), Variable = Identifier.X }
                            ]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(9) },
                                new() { Coefficient = new Coefficient(-3), Variable = Identifier.Y }
                            ]
                        },
                    },
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(4), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(-5), Variable = Identifier.Y }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(13) }]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(4), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(5), Variable = Identifier.Y }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(-13) }]
                        },
                    }
                ],
                SelfExplanationTask = new ExtendedSelfExplanation()
                {
                    Method = Method.Substitution,
                    IsSingleChoice = false,
                    Options = new List<ExtendedOption> {
                        new(){
                            TextDE = "Das Einsetzungsverfahren kann auch direkt auf eines der beiden anderen Systeme angewendet werden, allerdings ist das System schwieriger zu lösen.",
                            TextEN = "The insertion method can also be applied directly to one of the other two systems, but the system is more difficult to solve.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Das Einsetzungsverfahren kann auf das gewählte System direkt angewendet werden, indem man 9/2-(3/2)y in die erste Gleichung für x einsetzt.",
                            TextEN = "The substitution method can be applied directly to the selected system by substituting 9/2-(3/2)y into the first equation for x.",
                            IsSolution = true
                        },
                        new(){
                            TextDE = "Das Einsetzungsverfahren kann immer direkt angewendet werden.",
                            TextEN = "The insertion procedure can always be used directly.",
                            ReasonDE = "Das Verfahren kann nur dann angewendet werden, wenn mindestens eine der Gleichungen im System nach x oder y gelöst ist.",
                            ReasonEN = "The method can only be used if at least one of the equations in the system is solved for x or y.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Das Einsetzungsverfahren kann auf das gewählte System direkt angewendet werden, indem man 3+(5/2)x in die zweite Gleichung für y einsetzt.",
                            TextEN = "The substitution method can be applied directly to the selected system by substituting 3+(5/2)x into the second equation for y.",
                            IsSolution = true
                        }
                    }
                },
                AgentMessageForSelfExplanationDE = "Indem du Lösungen erklärst, verstehst du die Konzepte viel besser und merkst, wie alles zusammenhängt.",
                AgentMessageForSelfExplanationEN = "By explaining solutions, you understand the concepts much better and realise how everything is connected.",
                AgentMessageForFirstSolutionDE = "Durch das Rechnen von Hand verstehst du besser, wie mathematische Konzepte und Regeln zusammenhängen",
                AgentMessageForFirstSolutionEN = "By calculating by hand, you will better understand how mathematical concepts and rules are related.",
                AgentMessageForSecondSolutionDE = "Verschiedene Rechnungen von Hand auszuprobieren macht dich flexibel und anpassungsfähig bei der Lösung von Problemen.",
                AgentMessageForSecondSolutionEN = "Trying out different calculations by hand makes you flexible and adaptable when solving problems.",
            };

            ExtendedMatchingExercise equalization2 = new()
            {
                Id = 1,
                Ordering = 1,
                FirstEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient(7) },
                        new() { Coefficient = new Coefficient(-1), Variable = Identifier.X }
                    ]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms = [
                        new() { Coefficient = new Coefficient(1), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(5) }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.SecondMultiple,
                SecondEquationIsIsolatedIn = IsolatedIn.SecondMultiple,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(1) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(3) },
                Method = Method.Equalization,
                AlternativeSystems = [
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(5) },
                                new() { Coefficient = new Coefficient(-3), Variable = Identifier.Y }
                            ]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(4), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(11) },
                                new() { Coefficient = new Coefficient(-7), Variable = Identifier.Y }
                            ]
                        },
                    },
                    new() {
                        FirstEquation = new LinearEquation
                        {
                            LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.X }],
                            RightTerms =
                            [
                                new() { Coefficient = new Coefficient(3), Variable = Identifier.Y },
                                new() { Coefficient = new Coefficient(4) }
                            ]
                        },
                        SecondEquation = new LinearEquation
                        {
                            LeftTerms =
                            [
                                new() { Coefficient = new Coefficient(2), Variable = Identifier.X },
                                new() { Coefficient = new Coefficient(4) }
                            ],
                            RightTerms = [new() { Coefficient = new Coefficient(3), Variable = Identifier.Y }]
                        },
                    }
                ],
                SelfExplanationTask = new ExtendedSelfExplanation()
                {
                    Method = Method.Equalization,
                    IsSingleChoice = true,
                    Options = new List<ExtendedOption> {
                        new(){
                            TextDE = "Das ausgewählte System muss durch den Faktor 2 geteilt werden, dann kann das Gleichsetzungsverfahren angewendet werden.",
                            TextEN = "The selected system must be divided by a factor of 2, then the equalization method can be applied.",
                            ReasonDE = "Das System muss nicht umgeformt werden, um das Verfahren anwenden zu können.",
                            ReasonEN = "The system does not need to be remodelled in order to use the method.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Teilt man die anderen beiden Systeme durch den Faktor 2, hätte auch hier das Gleichsetzungsverfahren direkt angewendet werden können.",
                            TextEN = "If the other two systems are divided by a factor of 2, the equating method could also have been applied directly here.",
                            ReasonDE = "Es sind mehrere Umformungen notwendig.",
                            ReasonEN = "Several transformations are necessary.",
                            IsSolution = false
                        },
                        new(){
                            TextDE = "Die Terme 7-x und x+5 können gleichgesetzt werden.",
                            TextEN = "The terms 7-x and x+5 can be equated.",
                            IsSolution = true
                        },
                        new(){
                            TextDE = "Alle System sind direkt mit dem Gleichsetzungsverfahren lösbar.",
                            TextEN = "All systems can be solved directly using the equalization method.",
                            ReasonDE = "Die anderen beiden Systeme müssten zunächst umgeformt werden.",
                            ReasonEN = "The other two systems would first have to be remodelled.",
                            IsSolution = false
                        }
                    }
                },
                AgentMessageForSelfExplanationDE = "Wenn du deine Lösungen erklärst, siehst du sofort, wo du noch Unsicherheiten hast und was du noch üben musst.",
                AgentMessageForSelfExplanationEN = "When you explain your solutions, you can immediately see where you still have uncertainties and what you still need to practise.",
                AgentMessageForFirstSolutionDE = "Verschiedene Rechnungen von Hand auszuprobieren macht dich flexibel und anpassungsfähig bei der Lösung von Problemen.",
                AgentMessageForFirstSolutionEN = "Trying out different calculations by hand makes you flexible and adaptable when solving problems.",
                AgentMessageForSecondSolutionDE = "Wenn du von Hand rechnest, wirst du unabhängiger von technischen Hilfsmitteln und kannst dich auf deine eigenen Fähigkeiten verlassen.",
                AgentMessageForSecondSolutionEN = "If you calculate by hand, you become less dependent on technical aids and can rely on your own skills.",
            };

            return [equalization1, elimination1, substitution1, equalization2];
        }
    }
}
