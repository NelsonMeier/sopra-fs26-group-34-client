"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ConfigProvider, Table, message } from "antd";
import { TrophyFilled } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";

interface ResultRow {
	key: string;
	round: string;
	game: "Reaction Time" | "Typing Speed";
	score: string;
}

const toNumberArray = (raw: string | null): number[] => {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((value) => Number(value))
			.filter((value) => Number.isFinite(value));
	} catch {
		return [];
	}
};

const ResultsPage: React.FC = () => {
	const router = useRouter();
	const apiService = useApi();
	const { value: userId } = useLocalStorage<string>("userId", "");
	const { value: token } = useLocalStorage<string>("token", "");
	const [rows, setRows] = useState<ResultRow[]>([]);
	const [bestReactionScore, setBestReactionScore] = useState<number | null>(null);
	const [bestTypingScore, setBestTypingScore] = useState<number | null>(null);
	const [reactionHighScoreUpdated, setReactionHighScoreUpdated] = useState(false);
	const [typingHighScoreUpdated, setTypingHighScoreUpdated] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const reactionScores = toNumberArray(globalThis.sessionStorage.getItem("reactionScores"));
		const typingScores = toNumberArray(globalThis.sessionStorage.getItem("typingScores"));

		const reactionRows: ResultRow[] = reactionScores.map((score, index) => ({
			key: `reaction-${index}`,
			round: `${index + 1}.`,
			game: "Reaction Time",
			score: score === -1 ? "Failed" : `${score} ms`,
		}));

		const typingRows: ResultRow[] = typingScores.map((score, index) => ({
			key: `typing-${index}`,
			round: `${reactionRows.length + index + 1}.`,
			game: "Typing Speed",
			score: `${score} wpm`,
		}));

		setRows([...reactionRows, ...typingRows]);

		// Calculate best scores for state
		const validReactionScores = reactionScores.filter((s) => s !== -1);
		const bestReaction =
			validReactionScores.length > 0 ? Math.min(...validReactionScores) : null;
		const bestTyping = typingScores.length > 0 ? Math.max(...typingScores) : null;

		setBestReactionScore(bestReaction);
		setBestTypingScore(bestTyping);


		const submitHighScores = async () => {
			try {
				interface HighScoreResponse {
					reactionHighScoreUpdated: boolean;
					typingHighScoreUpdated: boolean;
				}

				const response = await apiService.put<HighScoreResponse>(
					`/users/${userId}/highscores`,
					{
						reactionScores: reactionScores.length > 0 ? reactionScores : [],
						typingScores: typingScores.length > 0 ? typingScores : [],
					},
					{ Authorization: `Bearer ${token}` }
				);

				setReactionHighScoreUpdated(response.reactionHighScoreUpdated);
				setTypingHighScoreUpdated(response.typingHighScoreUpdated);

				if (response.reactionHighScoreUpdated && response.typingHighScoreUpdated) {
					const reactionText = `Reaction Time (${bestReactionScore} ms)`;
					const typingText = `Typing Speed (${bestTypingScore} WPM)`;
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: ${reactionText} & ${typingText}`,
					});
				} else if (response.reactionHighScoreUpdated) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Reaction Time (${bestReactionScore} ms)`,
					});
				} else if (response.typingHighScoreUpdated) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Typing Speed (${bestTypingScore} WPM)`,
					});
				}
			} catch (error) {
				console.error("Error submitting high scores:", error);
			}
		};

		if (userId && token && (reactionScores.length > 0 || typingScores.length > 0)) {
			submitHighScores();
		}
	}, [userId, token]);

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#6BAED6",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
			}}
		>
			<div className="back-button-anchor">
				<Link href={`/users/${userId}`}>
					<Button type="primary" className="back-button">
						Back to Profile
					</Button>
				</Link>

				<Button
					type="primary"
					onClick={() => router.push("/singleplayer")}
					className="back-button"
				>
					Back to Games
				</Button>
			</div>

			<div
				style={{
					width: "100%",
					maxWidth: "760px",
					backgroundColor: "#B8D8E8",
					borderRadius: "16px",
					padding: "1rem",
					boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
				}}
			>
				<ConfigProvider //without this the background color of the table is dark gray, this overrides that
					theme={{
						token: {
							fontFamily: "var(--font-chewy)",
							fontSize: 22,
						},
						components: {
							Table: {
								headerBg: "#B8D8E8",
								headerColor: "#000000",
								colorBgContainer: "#B8D8E8",
								borderColor: "rgba(0,0,0,0.2)",
							},
						},
					}}
				>
					<Table<ResultRow>
						columns={[
							{
								title: "Round",
								dataIndex: "round",
								key: "round",
								width: "20%",
							},
							{
								title: "Game",
								dataIndex: "game",
								key: "game",
								width: "40%",
							},
							{
								title: "Score",
								dataIndex: "score",
								key: "score",
								width: "40%",
								render: (text: string, record: ResultRow) => {
									const isReactionHigh =
										record.game === "Reaction Time" &&
										reactionHighScoreUpdated &&
										text !== "Failed" &&
										parseInt(text) === bestReactionScore;
									const isTypingHigh =
										record.game === "Typing Speed" &&
										typingHighScoreUpdated &&
										parseInt(text) === bestTypingScore;
									const isHighScore = isReactionHigh || isTypingHigh;

									return (
										<span style={{ fontWeight: isHighScore ? "bold" : "normal" }}>
											{isHighScore && (
												<TrophyFilled
													style={{ color: "#faad14", marginRight: "0.5rem" }}
												/>
											)}
											{text}
										</span>
									);
								},
							},
						]}
						dataSource={rows}
						pagination={false}
						scroll={{ y: 8 * 54 }}
						locale={{ emptyText: "No session scores found." }}
					/>
				</ConfigProvider>
			</div>
		</div>
	);
};

export default ResultsPage;

