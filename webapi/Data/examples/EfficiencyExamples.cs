using webapi.Models.Flexibility;
using webapi.Models.Math;

namespace webapi.Data.Examples
{
    public class EfficiencyExamples
    {
        public static List<ExtendedEfficiencyExercise> GetExamples()
        {
            ExtendedEfficiencyExercise substitution1 = new()
            {
                Id = 1,
                Ordering = 1,
                TransformationRequired = false,
                FirstEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(2), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(1), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(5) }]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(1), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient(2) },
                        new() { Coefficient = new Coefficient(1), Variable = Identifier.X }
                    ],
                },
                FirstEquationIsIsolatedIn = IsolatedIn.None,
                SecondEquationIsIsolatedIn = IsolatedIn.Second,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(1) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(3) },
                EfficientMethods = [Method.Substitution],
                SelfExplanationTasks = [
                    new()
                    {
                        Method = Method.Substitution,
                        IsSingleChoice = true,
                        Options = new List<ExtendedOption> {
                            new(){
                                TextDE = "Die erste Gleichung kann in die zweite Gleichung eingesetzt werden.",
                                TextEN = "The first equation can be inserted into the second equation.",
                                ReasonDE = "Die erste Gleichung ist weder nach x noch nach y aufgelöst.",
                                ReasonEN = "The first equation is neither solved for x nor for y.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Der Term 2+x kann für die Variable y in die erste Gleichung eingesetzt werden.",
                                TextEN = "The term 2+x can be used for the variable y in the first equation.",
                                IsSolution = true
                            },
                            new(){
                                TextDE = "y kann in die erste Gleichung für die Variable x eingesetzt werden.",
                                TextEN = "y can be inserted into the first equation for the variable x.",
                                ReasonDE = "Höchstens y-2 kann in die erste Gleichung für die Variable x eingesetzt werden.",
                                ReasonEN = "At most y-2 can be substituted into the first equation for the variable x.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Die erste Gleichung muss zunächst nach y aufgelöst werden. Das Ergebnis kann dann in die zweite Gleichung eingesetzt werden.",
                                TextEN = "The first equation must first be solved for y. The result can then be used in the second equation.",
                                ReasonDE = "Das Einsetzungsverfahren kann direkt angewendet werden, ohne dass es zusätzliche Transformationen braucht.",
                                ReasonEN = "The insertion procedure can be used directly without the need for additional transformations.",
                                IsSolution = false
                            }
                        }
                    }
                ],
                AgentMessageForSelfExplanationDE = "Das Erklären hilft dir, Informationen länger zu behalten. Du merkst dir besser, was du verstehst und was du noch lernen musst.",
                AgentMessageForSelfExplanationEN = "Explaining helps you to retain information for longer. You memorise better what you understand and what you still need to learn.",
                AgentMessageForFirstSolutionDE = "Wenn du regelmäßig von Hand rechnest, wirst du schneller und effizienter im Lösen von Aufgaben.",
                AgentMessageForFirstSolutionEN = "If you regularly calculate by hand, you will become faster and more efficient at solving tasks.",
                AgentMessageForSecondSolutionDE = "In vielen Prüfungen ist manuelles Rechnen erforderlich. Regelmäßiges Üben bereitet dich optimal darauf vor.",
                AgentMessageForSecondSolutionEN = "Manual calculations are required in many exams. Regular practice prepares you optimally for this."
            };

            ExtendedEfficiencyExercise elimination1 = new()
            {
                Id = 2,
                Ordering = 2,
                TransformationRequired = false,
                FirstEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(3), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(4), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(-2) }]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(3), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(5), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(-1) }]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.None,
                SecondEquationIsIsolatedIn = IsolatedIn.None,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(-2) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(1) },
                EfficientMethods = [Method.Elimination],
                SelfExplanationTasks = [
                                new()
                    {
                        Method = Method.Elimination,
                        IsSingleChoice = false,
                        Options = new List<ExtendedOption> {
                            new(){
                                TextDE = "Durch Subtrahieren der ersten Gleichung von der zweiten Gleichung kann die Variable x eliminiert werden.",
                                TextEN = "The variable x can be eliminated by subtracting the first equation from the second equation.",
                                IsSolution = true
                            },
                            new(){
                                TextDE = "Durch Subtrahieren der ersten Gleichung von der zweiten Gleichung kann die Variable y eliminiert werden.",
                                TextEN = "The variable y can be eliminated by subtracting the first equation from the second equation.",
                                ReasonDE = "Subtrahiert man die erste von der zweiten Gleichung, bleibt 1y übrig.",
                                ReasonEN = "If you subtract the first equation from the second, you are left with 1y.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Durch Subtrahieren der zweiten Gleichung von der ersten Gleichung kann die Variable x eliminiert werden.",
                                TextEN = "The variable x can be eliminated by subtracting the second equation from the first equation.",
                                IsSolution = true
                            },
                            new(){
                                TextDE = "Durch Addieren beider Gleichungen fällt die Variable x weg.",
                                TextEN = "Adding both equations eliminates the variable x.",
                                ReasonDE = "Durch Addieren erhält man eine Gleichung, die 6x enthält.",
                                ReasonEN = "Adding gives an equation containing 6x.",
                                IsSolution = false
                            }
                        }
                    }
                            ],
                AgentMessageForSelfExplanationDE = "Das Erklären hilft dir, Verbindungen zwischen verschiedenen Themen zu erkennen und ein tieferes Verständnis zu entwickeln.",
                AgentMessageForSelfExplanationEN = "Explaining helps you to recognise connections between different topics and develop a deeper understanding.",
                AgentMessageForFirstSolutionDE = "Computer machen manchmal Fehler oder werden falsch bedient. Wenn du regelmäßig von Hand rechnest, kannst du solche Fehler leicht erkennen und korrigieren.",
                AgentMessageForFirstSolutionEN = "Computers sometimes make mistakes or are operated incorrectly. If you regularly calculate by hand, you can easily recognise and correct such errors.",
                AgentMessageForSecondSolutionDE = "Wenn du regelmäßig von Hand rechnest, wirst du schneller und effizienter im Lösen von Aufgaben.",
                AgentMessageForSecondSolutionEN = "If you regularly calculate by hand, you will become faster and more efficient at solving tasks."
            };

            ExtendedEfficiencyExercise elimination2 = new()
            {
                Id = 3,
                Ordering = 3,
                TransformationRequired = false,
                FirstEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(-7), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(6), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(-9) }]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(3), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(4), Variable = Identifier.Y }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(17) }]
                },
                FirstEquationIsIsolatedIn = IsolatedIn.None,
                SecondEquationIsIsolatedIn = IsolatedIn.None,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(3) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(2) },
                EfficientMethods = [Method.Elimination],
                SelfExplanationTasks = [
                                new()
                    {
                        Method = Method.Elimination,
                        IsSingleChoice = false,
                        Options = new List<ExtendedOption> {
                            new(){
                                TextDE = "Multipliziert man die erste Gleichung mit dem Faktor 2 und die zweite Gleichung mit dem Faktor 3 und subtrahiert eine Gleichung von der anderen, so entfällt die Variable y.",
                                TextEN = "If you multiply the first equation by a factor of 2 and the second equation by a factor of 3 and subtract one equation from the other, the variable y is omitted.",
                                IsSolution = true
                            },
                            new(){
                                TextDE = "Durch Subtrahieren der ersten Gleichung von der zweiten Gleichung kann die Variable y eliminiert werden.",
                                TextEN = "The variable y can be eliminated by subtracting the first equation from the second equation.",
                                ReasonDE = "Subtrahiert man die erste von der zweiten Gleichung, bleibt 2y übrig.",
                                ReasonEN = "Subtracting the first from the second equation leaves 2y.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Durch Addieren beider Gleichungen entfällt die Variable x.",
                                TextEN = "Adding both equations eliminates the variable x.",
                                ReasonDE = "Addiert man beide Gleichungen, bleibt -4x stehen.",
                                ReasonEN = "If you add both equations together, you get -4x.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Multipliziert man die erste Gleichung mit dem Faktor 3 und die zweite Gleichung mit dem Faktor 7 und addiert beide Gleichungen, so entfällt die Variable x.",
                                TextEN = "If you multiply the first equation by a factor of 3 and the second equation by a factor of 7 and add both equations together, the variable x is omitted.",
                                IsSolution = true
                            }
                        }
                    }
                            ],
                AgentMessageForSelfExplanationDE = "Wenn du deine Lösungen erklärst, siehst du sofort, wo du noch Unsicherheiten hast und was du noch üben musst.",
                AgentMessageForSelfExplanationEN = "When you explain your solutions, you can immediately see where you still have uncertainties and what you still need to practise.",
                AgentMessageForFirstSolutionDE = "Durch das Lösen von Gleichungen von Hand wirst du unabhängiger von Technologie.",
                AgentMessageForFirstSolutionEN = "Solving equations by hand makes you less dependent on technology.",
                AgentMessageForSecondSolutionDE = "Computer machen manchmal Fehler oder werden falsch bedient. Wenn du regelmäßig von Hand rechnest, kannst du solche Fehler leicht erkennen und korrigieren.",
                AgentMessageForSecondSolutionEN = "Computers sometimes make mistakes or are operated incorrectly. If you regularly calculate by hand, you can easily recognise and correct such errors."
            };

            ExtendedEfficiencyExercise substitution2 = new()
            {
                Id = 4,
                Ordering = 4,
                TransformationRequired = false,
                UseWithTip = true,
                FirstEquation = new LinearEquation
                {
                    LeftTerms =
                    [
                        new() { Coefficient = new Coefficient(3), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(2), Variable = Identifier.Y, IsUnion = true }
                    ],
                    RightTerms = [new() { Coefficient = new Coefficient(8) }]
                },
                SecondEquation = new LinearEquation
                {
                    LeftTerms = [new() { Coefficient = new Coefficient(2), Variable = Identifier.Y }],
                    RightTerms =
                    [
                        new() { Coefficient = new Coefficient(1), Variable = Identifier.X },
                        new() { Coefficient = new Coefficient(-8) }
                    ],
                },
                FirstEquationIsIsolatedIn = IsolatedIn.None,
                SecondEquationIsIsolatedIn = IsolatedIn.SecondMultiple,
                FirstVariable = new() { Name = Identifier.X, Value = new Coefficient(4) },
                SecondVariable = new() { Name = Identifier.Y, Value = new Coefficient(-2) },
                EfficientMethods = [Method.Substitution],
                SelfExplanationTasks = [
                    new()
                    {
                        Method = Method.Substitution,
                        IsSingleChoice = true,
                        Options = new List<ExtendedOption> {
                            new(){
                                TextDE = "Die erste Gleichung kann in die zweite Gleichung eingesetzt werden.",
                                TextEN = "The first equation can be inserted into the second equation.",
                                ReasonDE = "Die erste Gleichung ist weder nach x noch nach y aufgelöst.",
                                ReasonEN = "The first equation is neither solved for x nor for y.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Der Term x-8 kann für die Variable y in die erste Gleichung eingesetzt werden.",
                                TextEN = "The term x-8 can be used for the variable y in the first equation.",
                                ReasonDE = "Betrachte die zweite Gleichung genau. x-8 ist nicht das selbe wie y.",
                                ReasonEN = "Look carefully at the second equation. x-8 is not the same as y.",
                                IsSolution = false
                            },
                            new(){
                                TextDE = "Der Term 2y kann in der ersten Gleichung durch x-8 ersetzt werden.",
                                TextEN = "The term 2y can be replaced with x-8 in the first equation.",
                                IsSolution = true
                            },
                            new(){
                                TextDE = "Die zweite Gleichung muss zunächst nach y gelöst werden. Das Ergebnis kann dann in die erste Gleichung eingesetzt werden.",
                                TextEN = "The second equation must first be solved for y. The result can then be inserted into the first equation.",
                                ReasonDE = "Das Einsetzungsverfahren kann direkt angewendet werden, ohne dass es zusätzliche Transformationen braucht.",
                                ReasonEN = "The insertion procedure can be used directly without the need for additional transformations.",
                                IsSolution = false
                            }
                        }
                    }
                ],
                AgentMessageForSelfExplanationDE = "Indem du verschiedene Wege erklärst, merkst du, dass es oft mehrere Lösungen für ein Problem gibt.",
                AgentMessageForSelfExplanationEN = "By explaining different ways, you realise that there are often several solutions to a problem.",
                AgentMessageForFirstSolutionDE = "Wenn du regelmäßig von Hand rechnest, lernst du, genauer zu arbeiten und auf Details zu achten.",
                AgentMessageForFirstSolutionEN = "If you regularly calculate by hand, you will learn to work more accurately and pay attention to details.",
                AgentMessageForSecondSolutionDE = "Rechner und Computer sind nicht immer verfügbar. Wenn du von Hand rechnen kannst, bist du in jeder Situation gut vorbereitet.",
                AgentMessageForSecondSolutionEN = "Calculators and computers are not always available. If you can calculate by hand, you are well prepared in any situation."
            };

            return [substitution1, elimination1, elimination2, substitution2];
        }
    }
}
